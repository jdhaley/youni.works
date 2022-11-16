export default {
	Workbench: {
		type: "Display",
		title: "Workbench",
        view: {
            header: {
            },
			content: {
                type: "Tabs",
                tabType: "Tab"
             },
			footer: {
                type$: "Display"
            }
		},
	},
    WorkbenchTab: {
        type: "Tab"
    },
	tasks: {
		type: "list",
		title: "Tasks",
		types: {
			task: "task"
		}
	},
	unknown: "text",
	person: {
		type: "record",
		title: "Person",
		types: {
			firstName: {
				type: "text",
				title: "Given Name",
			},
			lastName: {
				type: "text",
				title: "Surname",
			},
			email: {
				type: "text",
				title: "e-mail",
			},
			address: {
				type: "address",
				title: "Address"
			}
		}
	},
	address: {
		type: "record",
		title: "Address",
		types: {
			street: {
				type: "text",
				title: "Street"
			},
			city: {
				type: "text",
				title: "City"
			},
			code: {
				type: "text",
				title: "Postal Area Code"
			}
		}
	},
	note: {
		type: "markup",
		types: {
			para: {
				type: "line"
			},
			heading: {
				type: "line"
			},
			worktask: "worktask"
		}
	},
	row: "row",
	cell: {
		type: "text",
		container: false,
		tagName: "ui-cell"
	},
}

let x = {
	type$: "/ui/agent",
    App: {
        type$: ["Component", "Receiver", "/base/origin/Origin"],
		start() {
            console.log("Starting application", this[Symbol.for("owner")]);
            let conf = this.conf;
            this.define(this.frame, "app", this);
            this.frame.start(this.conf);
        },
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
                type$: "/ui/tabs/Tabs",
                extend$conf: {
                    tabType: "/workbench/WorkbenchTab"
                }        
            },
			footer: {
                type$: "Display"
            }
		},
        modelFor(key) {
            if (key == "body") return this.conf.views;
        }
    },
 }