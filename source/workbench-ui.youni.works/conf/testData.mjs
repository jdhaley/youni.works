export default {
    type$: "/base/data/DataSource",
    type$viewType: "/ui/table/Cell",
    types: {
        "Design": {
            "members": {
                "id": {
                    "columnSize": 4
                },
                "shape": {
                    "columnSize": 4,
                    "choice": {
                        "r": "Rectangle",
                        "t": "Triangle",
                        "d": "Diamond",
                        "o": "Oval",
                        "x": "Irregular"
                    }
                },
                "width": {
                    "dataType": "number",
                    "columnSize": 4
                },
                "height": {
                    "dataType": "number",
                    "columnSize": 4
                }
            }
        },
        "Issue": {
            "members": {
                "id": {
                    "columnSize": 3
                },
                "issued": {
                    "dataType": "date",
                    "inputType": "string",
                    "columnSize": 4,
                    "flex": false
                },
                "design": {
                    "columnSize": 3,
                    "flex": false,
                    "dataType": "link",
                    "objectType": "Design",
                    "dataset": "Design",
                    "readOnly": false
                },
                "denom": {
                    "caption": "Denomination",
                    "columnSize": 4
                },
                "colors": {
                    "columnSize": 2,
                    "flex": false,
                    "inputType": "color"
                },
                "subject": {
                    "columnSize": 6
                },
                "image": {
                    "dataType": "media",
                    "mediaType": "image",
                    "columnSize": 8
                }
            }
        }
    },
    data: {
        "designs": {
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
        "issues": [
            {
                "id": "GB21",
                "issued": "1960-03-01",
                "design": "GB1A",
                "denom": "1d",
                "colors": "black",
                "subject": "",
                "image": "/file/stamp/GB1As.png"
            },
            {
                "id": "GB22",
                "issued": "1960-03-01",
                "design": "GB1D",
                "denom": "2d",
                "colors": "blue",
                "subject": "",
                "image": "/file/stamp/GB1Ds.png"
            },
            {
                "id": "GB23",
                "issued": "1960-03-01",
                "design": "GB1A",
                "denom": "3d",
                "colors": "red",
                "subject": "",
                "image": "/file/stamp/x.png"
            },
            {
                "id": "GB24",
                "issued": "1960-03-01",
                "design": "GB1A",
                "denom": "1d",
                "colors": "black",
                "subject": "",
                "image": "/file/stamp/GB1As.png"
            },
            {
                "id": "GB25",
                "issued": "1960-03-01",
                "design": "GB1D",
                "denom": "2d",
                "colors": "blue",
                "subject": "",
                "image": "/file/stamp/GB1Ds.png"
            },
            {
                "id": "GB26",
                "issued": "1960-03-01",
                "design": "GB1A",
                "denom": "3d",
                "colors": "red",
                "subject": "",
                "image": "/file/stamp/x.png"
            },
            {
                "id": "GB27",
                "issued": "1960-03-01",
                "design": "GB1A",
                "denom": "1d",
                "colors": "black",
                "subject": "",
                "image": "/file/stamp/GB1As.png"
            },
            {
                "id": "GB28",
                "issued": "1960-03-01",
                "design": "GB1D",
                "denom": "2d",
                "colors": "blue",
                "subject": "",
                "image": "/file/stamp/GB1Ds.png"
            },
            {
                "id": "GB29",
                "issued": "1960-03-01",
                "design": "GB1A",
                "denom": "3d",
                "colors": "red",
                "subject": "",
                "image": "/file/stamp/x.png"
            },
            {
                "id": "GB210",
                "issued": "1960-03-01",
                "design": "GB1A",
                "denom": "3d",
                "colors": "red",
                "subject": "",
                "image": "/file/stamp/x.png"
            }
        ]
    }
}