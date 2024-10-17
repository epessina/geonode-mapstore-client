/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect } from 'react';
import validator from '@rjsf/validator-ajv8';
import Form from '@rjsf/core';
import isEqual from 'lodash/isEqual';
import { Alert, ButtonToolbar } from 'react-bootstrap';
import { getMetadataByPk, updateMetadata } from '@js/api/geonode/v2/metadata';
import Button from '@js/components/Button';
import Message from '@mapstore/framework/components/I18N/Message';
import widgets from '../components/_widgets';
import templates from '../components/_templates';
import MainEventView from '@js/components/MainEventView';

function MetadataEditor({ pk, loaderComponent }) {
    const [metadata, setMetadata] = useState();
    const [initialMetadata, setInitialMetadata] = useState();
    const [schema, setSchema] = useState();
    const [uiSchema, setUISchema] = useState();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (pk) {
            setLoading(true);
            setError(false);
            getMetadataByPk(pk)
                .then((payload) => {
                    setUISchema(payload.uiSchema);
                    setSchema(payload.schema);
                    setMetadata(payload.metadata);
                    setInitialMetadata(payload.metadata);
                })
                .catch(() => {
                    setError(true);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [pk]);

    const [updating, setUpdating] = useState(false);
    const [updatingError, setUpdatingError] = useState(false);

    function handleUpdate() {
        setUpdating(true);
        setUpdatingError(false);
        updateMetadata(pk, metadata)
            .then(() => {
                setInitialMetadata(metadata);
            })
            .catch(() => {
                setUpdatingError(true);
            })
            .finally(() => {
                setUpdating(false);
            });
    }

    function handleChange(formData) {
        setUpdatingError(false);
        setMetadata(formData);
    }

    const Loader = loaderComponent;

    if (loading && Loader) {
        return (<Loader />);
    }

    if (error) {
        return (<MainEventView msgId={'gnviewer.metadataNotFound'} />);
    }

    if (!metadata && !schema) {
        return null;
    }

    const pendingChanges = !isEqual(initialMetadata, metadata);

    return (
        <div
            className="gn-metadata"
        >
            <div className="gn-metadata-container">
                <div className="gn-metadata-header">
                    <div style={{ display: 'flex', padding: '1rem 0', alignItems: 'self-start' }}>
                        <div style={{ flex: 1, fontSize: '1.5rem' }}>
                            <Message msgId="gnviewer.metadataFor" /> "{metadata?.title}"
                        </div>
                        <ButtonToolbar>
                            <Button
                                variant="primary"
                                disabled={!pendingChanges || updating}
                                className={pendingChanges ? 'gn-pending-changes-icon' : ''}
                                onClick={() => handleUpdate()}
                            >
                                <Message msgId="gnhome.update" />
                            </Button>
                        </ButtonToolbar>
                    </div>
                    {updatingError && <Alert bsStyle="danger" style={{ marginBottom: '0.25rem' }}>
                        <Message msgId="gnviewer.metadataUpdateError" />
                    </Alert>}
                </div>
                <Form
                    liveValidate
                    schema={schema}
                    widgets={widgets}
                    uiSchema={uiSchema}
                    formData={metadata}
                    validator={validator}
                    templates={templates}
                    onChange={({ formData }) => {
                        handleChange(formData);
                    }}
                >
                    <></>
                </Form>
            </div>
        </div>
    );
}

export default MetadataEditor;
