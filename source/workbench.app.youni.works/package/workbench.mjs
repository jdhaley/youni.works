export default {
	type$: "/ui/panel",
    type$tree: "/ui/tree",
    type$tabs: "/ui/tabs",
    type$Shape: "/ui/shape/Shape",
    ArticleView: {
        type$: "Display",
        
    },
    ArticleModel: {
        id: "",
        title: "",
        type: "",

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
        type$: "Section",
        nodeName: "main",
		direction: "horizontal",
		members: {
            type$header: "Display",
			type$body: "workbenchBody",
			type$footer: "workbenchFooter"
		}
    },
    workbenchFooter: {
        type$: "Display"
    },
	workbenchBody: {
        type$: "Structure",
		direction: "horizontal",
		members: {
			type$context: "context",
            type$content: "content"
		}
    },
    content: {
        type$: "Structure",
        members: {
            type$sidebar: "sidebar",
            type$tabs: "tabs/Tabs",
           // type$tables: "Display"
        }
    },
    context: {
        type$: "Display",
        add(icon) {
            let button = this.owner.create("/ui/pen/Image");
            this.append(button);
            return button;
        },
        display() {
            this.super(display);
            this.add("/res/icons/folder.svg");
        }
    },
    sidebar: {
        type$: ["Structure", "Shape"],
        members: {
            tree: {
                type$: "Collection",
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
}