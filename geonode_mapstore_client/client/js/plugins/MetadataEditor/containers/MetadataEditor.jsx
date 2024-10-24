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
import { Alert } from 'react-bootstrap';
import { getMetadataByPk, updateMetadata } from '@js/api/geonode/v2/metadata';
import Button from '@js/components/Button';
import Message from '@mapstore/framework/components/I18N/Message';
import widgets from '../components/_widgets';
import templates from '../components/_templates';
import fields from '../components/_fields';
import MainEventView from '@js/components/MainEventView';
import InputControlWithDebounce from '@js/components/InputControlWithDebounce';

function MetadataEditor({ pk, loaderComponent }) {
    const [metadata, setMetadata] = useState();
    const [initialMetadata, setInitialMetadata] = useState();
    const [schema, setSchema] = useState();
    const [uiSchema, setUISchema] = useState();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [filterText, setFilterText] = useState('');

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
        <div className="gn-metadata">
            <div className="gn-metadata-header">
                <div className="gn-metadata-title">
                    <Message msgId="gnviewer.metadataFor" /> "{metadata?.title}"
                </div>
                <div className="gn-metadata-toolbar">
                    <Button
                        size="sm"
                        variant="primary"
                        disabled={!pendingChanges || updating}
                        className={pendingChanges ? 'gn-pending-changes-icon' : ''}
                        onClick={() => handleUpdate()}
                    >
                        <Message msgId="gnhome.update" />
                    </Button>
                    <InputControlWithDebounce
                        value={filterText}
                        onChange={(value) => setFilterText(value)}
                    />
                </div>
                {updatingError && <Alert bsStyle="danger" style={{ margin: '0.25rem 0' }}>
                    <Message msgId="gnviewer.metadataUpdateError" />
                </Alert>}
            </div>
            <div className="gn-metadata-container">
                <Form
                    liveValidate
                    formContext={{
                        filterText
                    }}
                    schema={schema}
                    widgets={widgets}
                    uiSchema={uiSchema}
                    formData={metadata}
                    validator={validator}
                    templates={templates}
                    fields={fields}
                    experimental_defaultFormStateBehavior={{
                        arrayMinItems: {
                            populate: 'never',
                            mergeExtraDefaults: false
                        }
                    }}
                    onChange={({ formData }, id) => {
                        if (id) {
                            handleChange(formData);
                        }
                    }}
                >
                    <div />
                </Form>
            </div>
        </div>
    );
}

export default MetadataEditor;
