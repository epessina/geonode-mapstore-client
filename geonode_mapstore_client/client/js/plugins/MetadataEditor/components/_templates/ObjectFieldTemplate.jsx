
/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import DefaultObjectFieldTemplate from '@rjsf/core/lib/components/templates/ObjectFieldTemplate';
import Button from '@js/components/Button';
import { Glyphicon } from 'react-bootstrap';
import FaIcon from '@js/components/FaIcon';

function MetadataGroup({
    idSchema,
    title,
    group,
    expanded: expandedProp
}) {
    const [_expanded, setExpanded] = useState(false);
    const groupError = group.some(property => property.error);
    const expanded = expandedProp === undefined ? _expanded : expandedProp;
    return (
        <li>
            <Button className={groupError ? 'gn-metadata-error' : ''} size="xs" onClick={() => setExpanded((prevExpanded) => !prevExpanded)}>
                <Glyphicon glyph={expanded ? "bottom" : "next"}/>{' '}{title}{groupError ?  <>{' '}<FaIcon name="exclamation"/></> : null}
            </Button>
            {expanded ? <ul>
                {group
                    .map((property) => {
                        return (
                            <li key={property.name}>
                                <Button
                                    size="xs"
                                    className={property.error ? 'gn-metadata-error' : ''}
                                    onClick={() => {
                                        const id = idSchema[property.name]?.$id;
                                        const node = document.querySelector(`[for=${id}]`) || document.getElementById(id);
                                        if (node) {
                                            node.scrollIntoView({ behavior: "smooth", block: "start" });
                                        }
                                    }}>
                                    {property.title}
                                    {property.error ?  <>{' '}<FaIcon name="exclamation"/></> : null}
                                </Button>
                            </li>
                        );
                    })}
            </ul> : null}
        </li>
    );
}

function RootMetadata({
    idSchema,
    schema,
    uiSchema,
    properties,
    errorSchema,
    formContext
}) {
    const { filterText } = formContext;
    const groups = properties.reduce((acc, property) => {

        const title = schema?.properties?.[property.name]?.title || property.name;

        const _uiSchema = uiSchema?.[property?.name] || {};
        const options = _uiSchema?.['ui:options'] || {};
        if ((_uiSchema?.['ui:widget'] || options.widget) === 'hidden'
        || !title.toLowerCase().includes((filterText || '').toLowerCase())) {
            return acc;
        }
        const sectionKey = options?.['geonode-ui:group'] || 'General';
        const sectionItems = acc[sectionKey] || [];
        return {
            ...acc,
            [sectionKey]: [...sectionItems, { ...property, uiSchema: _uiSchema, schema: schema?.properties?.[property.name], error: errorSchema[property.name], title }]
        };
    }, {});

    return (
        <div className="gn-metadata-layout">
            <ul className="gn-metadata-list">
                {Object.keys(groups)
                    .filter(groupKey => groups[groupKey].length > 0)
                    .map((groupKey) => {
                        const group = groups[groupKey];
                        return (
                            <MetadataGroup
                                key={groupKey}
                                idSchema={idSchema}
                                title={groupKey}
                                group={group}
                                expanded={filterText ? true : undefined}
                            />
                        );
                    })}
            </ul>
            <div className="gn-metadata-groups">
                {Object.keys(groups)
                    .filter(groupKey => groups[groupKey].length > 0)
                    .map((groupKey, idx) => {
                        const group = groups[groupKey];
                        return (
                            <div className="gn-metadata-group" key={idx}>
                                <div className="gn-metadata-group-title">{groupKey}</div>
                                {group.map((property, jdx) => {
                                    return <React.Fragment key={`${idx}_${jdx}`}>{property.content}</React.Fragment>;
                                })}
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}

function ObjectFieldTemplate(props) {
    const isRoot = props?.idSchema?.$id === 'root';
    if (isRoot) {
        return <RootMetadata {...props}/>;
    }
    return (
        <DefaultObjectFieldTemplate {...props}/>
    );
}

export default ObjectFieldTemplate;
