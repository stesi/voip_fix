# -*- coding: utf-8 -*-
{
    'name': "Voip fix wss",



    'author': "Stesi consulting srl",
    'website': "http://www.stesi.consulting",

    'license': 'OPL-1',

    'category': 'Uncategorized',
    'version': '18.0.0.1',

    # any module necessary for this one to work correctly
    'depends': ['base','voip'],

  "assets": {
        "web.assets_backend": [
            "voip_fix/static/src/js/*"
        ],
    },
    # only loaded in demonstration mode
    'demo': [

    ],
}
