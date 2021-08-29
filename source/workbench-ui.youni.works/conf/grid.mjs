export default {
    types: {
        "Design": {
            "members": [
                {
                    "name": "id",
                    "columnSize": 4
                },
                {
                    "name": "shape",
                    "columnSize": 4,
                    "choice": {
                        "r": "Rectangle",
                        "t": "Triangle",
                        "d": "Diamond",
                        "o": "Oval",
                        "x": "Irregular"
                    }
                },
                {
                    "name": "width",
                    "dataType": "number",
                    "columnSize": 4
                },
                {
                    "name": "height",
                    "dataType": "number",
                    "columnSize": 4
                }
            ]
        },
        "Issue": {
            "members": [
                {
                    "name": "issued",
                    "dataType": "date",
                    "columnSize": 4,
                    "flex": false
                },
                {
                    "name": "design",
                    "columnSize": 3,
                    "flex": false,
                    "dataType": "link",
                    "objectType": "Design",
                    "dataset": "Design",
                    "readOnly": false
                },
                {
                    "name": "denom",
                    "caption": "Denomination",
                    "columnSize": 4
                },
                {
                    "name": "colors",
                    "columnSize": 2,
                    "flex": false,
                    "inputType": "color"
                },
                {
                    "name": "subject",
                    "columnSize": 6
                },
                {
                    "name": "image",
                    "dataType": "media",
                    "mediaType": "image",
                    "columnSize": 8
                }
            ]
        }
    },
    data: {
        "Design": {
            "GB1A": {
                "id": "GB1A",
                "shape": "r",
                "width": 20,
                "height": 25,
                "image": ""
            },
            "GB1D": {
                "id": "GB1A",
                "shape": "r",
                "width": 20,
                "height": 25,
                "image": ""
            }
        },
        "Issue": {
            "GB21": {
                "issued": "1960-03-01",
                "design": "GB1A",
                "denom": "1d",
                "colors": "black",
                "subject": "",
                "image": "/file/stamp/GB1As.png"
            },
            "GB22":	{
                "issued": "1960-03-01",
                "design": "GB1D",
                "denom": "2d",
                "colors": "blue",
                "subject": "",
                "image": "/file/stamp/GB1Ds.png"
            },
            "GB23":	{
                "issued": "1960-03-01",
                "design": "GB1A",
                "denom": "3d",
                "colors": "red",
                "subject": "",
                "image": "/file/stamp/x.png"
            },
            "GB24":{
                "issued": "1960-03-01",
                "design": "GB1A",
                "denom": "1d",
                "colors": "black",
                "subject": "",
                "image": "/file/stamp/GB1As.png"
            },
            "GB25":{
                "issued": "1960-03-01",
                "design": "GB1D",
                "denom": "2d",
                "colors": "blue",
                "subject": "",
                "image": "/file/stamp/GB1Ds.png"
            },
            "GB26":{
                "issued": "1960-03-01",
                "design": "GB1A",
                "denom": "3d",
                "colors": "red",
                "subject": "",
                "image": "/file/stamp/x.png"
            },
            "GB27":{
                "issued": "1960-03-01",
                "design": "GB1A",
                "denom": "1d",
                "colors": "black",
                "subject": "",
                "image": "/file/stamp/GB1As.png"
            },
            "GB28":{
                "issued": "1960-03-01",
                "design": "GB1D",
                "denom": "2d",
                "colors": "blue",
                "subject": "",
                "image": "/file/stamp/GB1Ds.png"
            },
            "GB29":{
                "issued": "1960-03-01",
                "design": "GB1A",
                "denom": "3d",
                "colors": "red",
                "subject": "",
                "image": "/file/stamp/x.png"
            },
            "GB210":{
                "issued": "1960-03-01",
                "design": "GB1A",
                "denom": "3d",
                "colors": "red",
                "subject": "",
                "image": "/file/stamp/x.png"
            }
        }
    }
}