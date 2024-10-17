/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactSelect from 'react-select';

function SelectWidget({
    // schema,
    // id,
    options,
    // required,
    // disabled,
    // readonly,
    value,
    multiple,
    // autofocus,
    // onChange,
    // onBlur,
    // onFocus,
    // rawErrors = [],
    placeholder
}) {
    return (
        <ReactSelect
            multi={multiple}
            value={value}
            placeholder={placeholder}
            options={(options?.enumOptions || []).map((option) => ({ label: option.label, value: option.value }))}
            onChange={() => {

            }}
        />
    );
}

export default SelectWidget;
