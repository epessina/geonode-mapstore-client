/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import axios from '@mapstore/framework/libs/ajax';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import get from 'lodash/get';
import {
    METADATA,
    RESOURCES,
    getEndpointUrl
} from './constants';

const checkRefOpenAPISchema = (json) => {
    if (isArray(json)) {
        return json.some((entry) => checkRefOpenAPISchema(entry));
    }
    if (isObject(json)) {
        return Object.keys(json).some((key) => {
            if (key === '$ref') {
                return true;
            }
            return checkRefOpenAPISchema(json[key]);
        });
    }
    return false;
};

const recursiveRefReplaceOpenAPISchema = (json, openAPI) => {
    const _openAPI = openAPI || json;
    if (isArray(json)) {
        return json.map((entry) => recursiveRefReplaceOpenAPISchema(entry, _openAPI));
    }
    if (isObject(json)) {
        const keys = Object.keys(json);
        if (keys.includes('$ref')) {
            const componentPath = (json.$ref || '').replace('#/', '').replace(/\//g, '.');
            const component = get(_openAPI, componentPath);
            return { ...component };
        }
        return keys.reduce((acc, key) => {
            acc[key] = recursiveRefReplaceOpenAPISchema(json[key], _openAPI);
            return acc;
        }, {});
    }
    return json;
};

const parseOpenAPISchema = (json) => {
    if (checkRefOpenAPISchema(json)) {
        const result = recursiveRefReplaceOpenAPISchema(json);
        return parseOpenAPISchema(result);
    }
    return json;
};

const parseUiSchema = (properties) => {
    return Object.keys(properties).reduce((acc, key) => {
        const entry = properties[key];
        const uiKeys = Object.keys(entry).filter(propertyKey => propertyKey.indexOf('ui:') === 0);
        if (uiKeys.length) {
            acc[key] = Object.fromEntries(uiKeys.map(uiKey => [uiKey, entry[uiKey]]));
        }
        if (entry.type === 'object') {
            const nestedProperties = parseUiSchema(entry?.properties);
            acc[key] = { ...acc[key], ...nestedProperties };
        }
        return acc;
    }, {});
};

let metadataSchemas;
export const getMetadataSchema = () => {
    if (metadataSchemas) {
        return Promise.resolve(metadataSchemas);
    }
    return axios.get(getEndpointUrl(METADATA, '/schema/'))
        .then(({ data }) => {
            const schema = parseOpenAPISchema(data);
            metadataSchemas = {
                schema: schema,
                uiSchema: parseUiSchema(schema?.properties || {})
            };
            return metadataSchemas;
        });
};

export const getMetadataByPk = (pk) => {
    return getMetadataSchema()
        .then(({ schema, uiSchema }) => {
            // simulate metadata endpoint with resources
            // to replace with metadata
            return axios.get(getEndpointUrl(RESOURCES, `/${pk}`))
                .then(({ data }) => {
                    const metadata = data?.resource;
                    return {
                        schema,
                        uiSchema,
                        metadata
                    };
                });
        });
};

export const updateMetadata = (pk, body) => {
    return axios.patch(getEndpointUrl(METADATA, `/${pk}`), body)
        .then(({ data }) => data);
};
