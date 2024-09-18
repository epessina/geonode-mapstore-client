import os
import json

from geoserver.catalog import FailedRequestError
from geonode.geoserver.helpers import gs_catalog
from geonode.layers.models import Dataset


def set_default_style_to_open_in_visual_mode(instance, **kwargs):
    if isinstance(instance, Dataset):
        style = gs_catalog.get_style(
            instance.name, workspace=instance.workspace
        ) or gs_catalog.get_style(instance.name)
        if style:
            headers = {"Content-type": "application/json", "Accept": "application/json"}
            data = {"style": {"metadata": {"msForceVisual": "true"}}}
            body_href = os.path.splitext(style.body_href)[0] + ".json"

            resp = gs_catalog.http_request(
                body_href, method="put", data=json.dumps(data), headers=headers
            )
            if resp.status_code not in (200, 201, 202):
                raise FailedRequestError(
                    "Failed to update style {} : {}, {}".format(
                        style.name, resp.status_code, resp.text
                    )
                )

def get_metadata_ui_schema():

    # the gn:layout is custom and it works with the `sectionId` and `gridArea` custom options
    layout = {
        'gn:layout': [
            {
                'id': "basic",
                'title': "Basic Metadata",
                'style': {
                    'display': "grid",
                    'gap': "1rem",
                    'gridTemplateRows': "auto auto auto",
                    'gridTemplateColumns': "1fr 0.5fr 0.5fr",
                    'gridTemplateAreas': "'left top-middle top-right' 'left right right' 'left bottom bottom' 'footer footer footer'"
                }
            },
            {
                'id': "location-and-licenses",
                'title': "Location and Licenses",
                'style': {
                    'display': "grid",
                    'gap': "1rem",
                    'gridTemplateRows': "auto auto",
                    'gridTemplateColumns': "1fr 1fr 1fr",
                    'gridTemplateAreas': "'left middle right' 'footer footer footer'"
                }
            },
            {
                'id': "_",
                'title': "Optional Metadata",
                'style': {
                    'maxWidth': "50ch"
                }
            }
        ]
    }

    return {
        'pk': {
            'ui:widget': "hidden"
        },
        'title': {
            'ui:help': "(Help from uiSchema) Name by which the cited resource is known",
            'ui:options': {
                'sectionId': "basic",
                'gridArea': "left"
            }
        },
        'regions': {
            'ui:widget': "select",
            'ui:options': {
                'sectionId': "location-and-licenses",
                'gridArea': "middle"
            }
        },
        **layout
    }
