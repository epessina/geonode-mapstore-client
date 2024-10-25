
from django.shortcuts import render
from django.utils.translation.trans_real import get_language_from_request
from django.utils import formats
from dateutil import parser

def _parse_value(value, schema):
    schema_type = schema.get('type')
    format = schema.get('format')
    if schema_type == 'string' and format in ['date-time']:
        if type(value) == str:
            return formats.date_format(parser.parse(value), "DATETIME_FORMAT")
        return formats.date_format(value, "DATETIME_FORMAT")
    if schema_type == 'string':
        if 'oneOf' in schema:
            for option in schema.get('oneOf'):
                if option.get('const') == value:
                    return option.get('title')
    return value

def _parse_schema_instance(instance, schema):
    metadata = {}
    for key in instance:
        if instance[key]:
            metadata[key] = {}
            property_schema = { "type": None }
            if key in schema:
                property_schema = schema[key]
            if property_schema['type'] == 'object':
                metadata[key]['value'] = _parse_schema_instance(instance[key], property_schema['properties'])
            else:
                metadata[key]['value'] = _parse_value(instance[key], property_schema)
            metadata[key]['schema'] = property_schema
    return metadata

def metadata(request, pk, template="geonode-mapstore-client/metadata.html"):

    from geonode.base.models import ResourceBase
    from geonode.metadata.manager import metadata_manager

    lang = get_language_from_request(request)[:2]
    schema = metadata_manager.get_schema(lang)
    resource = ResourceBase.objects.get(pk=pk)
    schema_instance = metadata_manager.build_schema_instance(resource)

    metadata = _parse_schema_instance(schema_instance, schema['properties'])

    metadata_groups = {}

    for key in metadata:
        property = metadata[key]
        ui_options = property.get('ui:options', {})
        group = 'General'
        if ui_options.get('geonode-ui:group'):
            group = ui_options.get('geonode-ui:group')
        if group not in metadata_groups:
            metadata_groups[group] = { }
        metadata_groups[group][key] = property

    return render(request, template, context={ "resource": resource, "metadata_groups": metadata_groups })

def metadata_embed(request, pk):
    return metadata(request, pk, template="geonode-mapstore-client/metadata_embed.html")
