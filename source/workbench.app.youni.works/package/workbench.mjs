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
        type$: "tabs/Tabs",
        display() {
            this.super(display);
            let content = this.add("Test", this.owner.create("/workbench/content"));
            this.activate(content);
        },
    },
    content: {
        type$: "tabs/Tabs",
        display() {
            this.super(display);
            let tree = this.add("Tree");
            this.add("Draw", this.owner.create("/ui/pen/Canvas"));
            this.add("Note", this.owner.create("/ui/note/Note"));
            let grid = this.owner.create({
                type$: "/ui/display/Display",
                nodeName: "iframe",
                display() {
                    this.peer.src = "https://localhost/app/test/grid.html"
                }
            })
            this.draw(this.add("Grid (iframe)", grid));
            this.add("Other One");
            this.add("Other Two");
            this.add("Other Three");
            this.add("Other Four");
            this.add("Other 5");
            this.add("Other 6");
            this.add("Other 7");
            this.activate(tree);
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