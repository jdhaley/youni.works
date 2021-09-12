export default {
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
                "dataset": "designs",
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
}
