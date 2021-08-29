export default {
	type$: "/ui/panel",
    type$tabs: "/ui/tabs",
    type$tree: "/ui/tree",
    type$Shape: "/ui/shape/Shape",
    ArticleView: {
        type$: "Display",
        
    },
    Article: {
        type$: "Display",
        type$origin: "/base/origin/Origin",
        start(conf) {
            this.origin.open(this.location)
        },
        extend$actions: {
            opened(message) {
                console.log(message);
            }
        }
        // group
        // member
        // revision: "",
        // priorRevision: "",
        // status: "",
        // content: ""          
    },
    Dyna: {
        panels: {
            "sidebar": "sidebar/name",
            "": ""
        }
    },
    App: {
        type$: "App"
    },
    Workbench: {
        type$: "Display",
        nodeName: "main",
        extend$conf: {
            views: {
            }
        },
		members: {
            header: {
                type$: "Display"
            },
			body: {
                type$: "tabs/Stack",
                extend$conf: {
                    indexType: "/workbench/WorkbenchTab"
                }        
            },
			footer: {
                type$: "Display"
            }
		},
        modelFor(part) {
            if (part == this.parts.body) return this.conf.views;
        }
    },
    WorkbenchTab: {
        type$: "tabs/Tab"
    },
	// workbenchBody: {
    //     type$: "tabs/Stack",
    //     extend$conf: {
    //         indexType: "/workbench/WorkbenchTab"
    //     },
    //     view(data) {
    //         this.super(view, data);
    //         let content = this.add({
    //             title: "Test"
    //         }, this.owner.create("/workbench/content"));
    //         this.add({
    //             title: "Test2",
    //             icon: "/res/icons/moon.svg"
    //         });
    //         this.activate(content);
    //     },
    // },
    // context: {
    //     type$: "Display",
    //     add(icon) {
    //         let button = this.owner.create("/ui/pen/Image");
    //         this.append(button);
    //         return button;
    //     },
    //     display() {
    //         this.super(display);
    //         this.add("/res/icons/folder.svg");
    //     }
    // },
    sidebar: {
        type$: ["Display", "Shape"],
        members: {
            tree: {
                type$: "Display",
                type$contentType: "tree/Item"
            },
            value: {
                type$: ["Display", "Shape"],
                nodeName: "pre",
                zones: {
                    border: {
                        top: 8
                    },
                    cursor: {
                        "TC": "ns-resize"
                    },
                    subject: {
                        "TC": "size"
                    }
                },
                extend$actions: {
                    showValue(event) {
                        this.peer.innerText = event.value;
                    },
                    size(event) {
                        if (event.track == this) {
                            let r = this.bounds;
                            this.bounds = {
                                height: r.bottom - event.clientY
                            }
                        }
                    }
                }        
            }
        },
        zones: {
            border: {
                right: 4
            },
            cursor: {
                "CR": "ew-resize",
            },
            subject: {
                "CR": "size",
            }
        },	
        extend$actions: {
            showValue(event) {
                this.owner.send(this.parts.value, event);
            },
            size(event) {
                if (event.track == this) {
                    let r = this.bounds;
                    this.bounds = {
                        width: event.clientX - r.left
                    }
                }
            }
        }
    },
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
    },
    content: {
        type$: "tabs/Stack",
        view(data) {
            this.super(view, data);
            //let tree = this.add("Tree");
            let draw = this.add({
                title: "Draw",
                icon: "/res/icons/photo.svg"
            }, this.owner.create("/ui/pen/Canvas"));
            this.add({
                title: "Note",
                icon: "/res/icons/book.svg"
            }, this.owner.create("/ui/note/Note"));
            this.add({
                title: "Table",
                icon: "/res/icons/work.svg"
            }, this.owner.create({
                type$: "/ui/grid/Table",
                conf: {
                    type$types: "/workbench/types",
                    type$data: "/workbench/data"
                }
            }));
            this.add({
                title: "Tree",
                icon: "/res/icons/folder-open.svg"
            }, this.owner.create({
                type$: "/ui/tree/Item",
             }));            
            this.activate(draw);
        }
    }
}