/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import axios from '@mapstore/framework/libs/ajax';
import {
    METADATA,
    getEndpointUrl
} from './constants';

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
            const schema = data;
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
            return axios.get(getEndpointUrl(METADATA, `/instance/${pk}/`))
                .then(({ data }) => {
                    const metadata = data;
                    return {
                        schema,
                        uiSchema,
                        metadata
                    };
                });
        });
};

export const updateMetadata = (pk, body) => {
    return axios.patch(getEndpointUrl(METADATA, `/instance/${pk}/`), body)
        .then(({ data }) => data);
};
