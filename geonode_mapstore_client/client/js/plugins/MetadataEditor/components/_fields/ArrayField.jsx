/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import DefaultArrayField from '@rjsf/core/lib/components/fields/ArrayField';
import SelectInfiniteScroll from '@js/components/SelectInfiniteScroll';
import axios from '@mapstore/framework/libs/ajax';
import isString from 'lodash/isString';

function ArrayField(props) {
    const {
        onChange,
        schema,
        formData,
        idSchema,
        name,
        uiSchema
    } = props;
    const autocomplete = uiSchema?.['ui:options']?.['geonode-ui:autocomplete'];
    if (autocomplete && schema?.items?.type === 'object' && schema?.items?.properties) {
        const autocompleteOptions = isString(autocomplete)
            ? { url: autocomplete }
            : autocomplete;
        const autocompleteUrl = autocompleteOptions?.url;
        const queryKey = autocompleteOptions?.queryKey || 'q';
        const resultsKey = autocompleteOptions?.resultsKey || 'results';
        const valueKey = autocompleteOptions?.valueKey || 'id';
        const labelKey = autocompleteOptions?.labelKey || 'label';
        const placeholder = autocompleteOptions?.placeholder ?? '...';
        return (
            <>
                <div id={idSchema.$id}>{schema?.title || name}</div>
                <SelectInfiniteScroll
                    value={formData.map((entry) => {
                        return {
                            result: entry,
                            value: entry[valueKey],
                            label: entry[labelKey]
                        };
                    })}
                    multi
                    placeholder={placeholder}
                    loadOptions={({ q, config, ...params }) => {
                        return axios.get(autocompleteUrl, {
                            ...config,
                            params: {
                                ...params,
                                ...(q && { [queryKey]: q }),
                                page: params.page
                            }
                        })
                            .then(({ data }) => {
                                return {
                                    isNextPageAvailable: false,
                                    results: data?.[resultsKey].map((result) => {
                                        return {
                                            selectOption: {
                                                result,
                                                value: result[valueKey],
                                                label: result[labelKey]
                                            }
                                        };
                                    })
                                };
                            });
                    }}
                    onChange={(selected) => {
                        onChange(selected.map(({ result, ...option }) => {
                            if (result === undefined) {
                                return option;
                            }
                            return Object.fromEntries(
                                Object.keys(schema.items.properties)
                                    .map((key) => [key, result[key]])
                            );
                        }));
                    }}
                />
            </>
        );
    }
    return <DefaultArrayField {...props}/>;
}

export default ArrayField;
