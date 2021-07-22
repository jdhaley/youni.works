export default {
	type$: "/panel",
    type$tree: "/tree",
    type$tabs: "/tabs",
    type$Shape: "/shape/Shape",
	Workbench: {
        type$: "Section",
		direction: "horizontal",
		members: {
            type$header: "Display",
			type$body: "WorkbenchBody",
			type$footer: "WorkbenchFooter"
		}
    },
    WorkbenchFooter: {
        type$: "Display"
    },
	WorkbenchBody: {
        type$: "Structure",
		direction: "horizontal",
		members: {
			type$context: "Context",
			type$sidebar: "Sidebar",
            main: {
                type$: "Structure",
                members: {
                    type$tabs: "tabs/Tabs",
                    type$tables: "Display"
                }
            }
		}
    },
    Context: {
        type$: "Display",
        add(icon) {
            let button = this.owner.create("/pen/Image");
            this.append(button);
            return button;
        },
        display() {
            this.super(display);
            this.add("/res/icons/folder.svg");
        }
    },
    Sidebar: {
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