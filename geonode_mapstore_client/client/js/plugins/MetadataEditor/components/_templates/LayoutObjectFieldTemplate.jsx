
/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import uniq from 'lodash/uniq';
import Tabs from '@js/components/Tabs';

function MetadataGridLayout({ properties, items, style}) {

    const gridAreas = uniq(items.map(item => item.gridArea || '')).filter(val => val);

    if (gridAreas.length) {
        return (
            <div style={style}>
                {gridAreas.map((gridArea) => {
                    const itemsInGroupArea = items.filter(item => item.gridArea === gridArea);
                    return (<div key={gridArea} style={{ gridArea }}>
                        {itemsInGroupArea.map((item, idx) => {
                            const element = properties.find(property => property.name === item.name);
                            return <React.Fragment key={idx}>{element.content}</React.Fragment>;
                        })}
                    </div>);
                })}
            </div>
        );
    }

    return (
        <div style={style}>
            {items.map((item, idx) => {
                const element = properties.find(property => property.name === item.name);
                return (<div key={idx} style={{ width: '100%' }}>{element.content}</div>);
            })}
        </div>
    );
}

const getTabs = ({ uiSchema, properties }) => {
    const layout = uiSchema?.['gn:layout'];
    const sections = properties.reduce((acc, property) => {
        const schema = uiSchema?.[property?.name] || {};
        // exclude hidden widgets
        if (schema['ui:widget'] === 'hidden') {
            return acc;
        }
        const options = schema?.['ui:options'] || {};
        const sectionKey = options?.sectionId || '_';
        const sectionItems = acc[sectionKey] || [];
        return {
            ...acc,
            [sectionKey]: [...sectionItems, { name: property?.name, gridArea: options.gridArea }]
        };
    }, {});
    return layout.filter(section => sections[section.id]).map(section => ({
        ...section,
        items: sections[section.id] || []
    }));
};

function LayoutObjectFieldTemplate(props) {
    const layout = props?.uiSchema?.['gn:layout'];
    if (layout && props?.idSchema?.$id === 'root') {
        const selectedTabId = layout[0].id;
        const tabs = getTabs(props);
        return (
            <div>
                <Tabs
                    className="tabs-underline"
                    selectedTabId={selectedTabId}
                    tabs={tabs.map((tab = {}, idx) => ({
                        title: <div>{idx + 1}{' '}{tab?.title}</div>,
                        eventKey: tab?.id,
                        component: (
                            <div style={{ padding: '2rem 0' }}>
                                <MetadataGridLayout items={tab.items} style={tab.style} properties={props.properties}/>
                            </div>
                        )
                    }))}
                />
            </div>
        );
    }
    return (
        <div style={{ maxWidth: '60ch' }}>
            {props.title}
            {props.description}
            {props.properties.map((element, key) => (
                <div className="property-wrapper" key={key}>{element.content}</div>
            ))}
        </div>
    );
}

export default LayoutObjectFieldTemplate;
