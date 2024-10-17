/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { createPlugin } from '@mapstore/framework/utils/PluginsUtils';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import MetadataEditor from './containers/MetadataEditor';
import { withRouter } from 'react-router';

const MetadataEditorComponent = ({ match,  ...props }) => {
    const { params } = match || {};
    const pk = params?.pk;
    return <MetadataEditor {...props} pk={pk}/>;
};

const MetadataEditorPlugin = connect(
    createSelector([], () => ({})),
    {}
)(withRouter(MetadataEditorComponent));

export default createPlugin('MetadataEditor', {
    component: MetadataEditorPlugin,
    containers: {},
    epics: {},
    reducers: {}
});
