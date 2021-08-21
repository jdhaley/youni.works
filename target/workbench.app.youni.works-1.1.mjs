import system from "./system.youni.works-2.1.mjs";
import base from "./base.youni.works-1.2.mjs";
import ui from "./ui.youni.works-1.1.mjs";
import compiler from "./compiler.youni.works-1.0.mjs";
const module = {
	"name": "workbench.app.youni.works",
	"version": "1.1",
	"moduleType": "app"
};
module.use = {
	system: system,
	base: base,
	ui: ui,
	compiler: compiler
}
module.package = {
	oldapp: oldapp(),
	workbench: workbench()
}
const conf = {
	"type$": "/workbench/App",
	"title": "Workbench",
	"frame": {
		"type$": "/ui/display/Frame",
		"editors": {
			"type$string": "/ui/editors/String",
			"type$number": "/ui/editors/Number",
			"type$date": "/ui/editors/Date",
			"type$boolean": "/ui/editors/Boolean",
			"type$link": "/ui/editors/Link",
			"type$color": "/ui/editors/Color"
		},
		"main": {
			"type": "/workbench/Workbench",
			"contexts": {
				"tab1": {
					"title": "",
					"icon": "/res/bag.svg",
					"body": {
					}
				},
				"tab2": {
					"title": "",
					"icon": "/res/bag.svg",
					"body": {
					}
				}
			}
		}
	},
	"conf": {
		"type$events": "/ui/gdr",
		"dataConverter": "/compiler/converter/Converter",
		"objectType": "Module",
		"dataset": "source",
		"dataSource": "/sources",
		"typeSource": "/file/workbench/types.json"
	}
};
const main = function main(module, conf) {
	module = module.use.system.load(module);
	let app = module.create(conf);
	app.conf.window = window;
	app.start();
	return module;
};
export default main(module, conf);
function oldapp() {
	const pkg = {
	"App": {
		"type$": "/ui/display/App",
		"type$frame": "/ui/display/Frame",
		"start": function start() {
            console.log("Starting application");
            let conf = this.conf;
            this.define(this.frame, "app", this);
            this.frame.start(this.conf);

            // if (conf.typeSource) {
            //     this.open(conf.typeSource, "initializeContext");                 
            // } else {
            //     this.frame.send(this, "initializeContext");
            // }
            // this.open(conf.dataSource, "initializeData");
        },
		"extend$actions": {
			"view": function view(msg) {
                this.view.view(this.data);
                this.view.send("view");
            },
			"initializeContext": function initializeContext(msg) {
                if (msg.response) {
                    let types = JSON.parse(msg.response);
                    this.types = this.create(types);
                } else {
                    this.types = this.create();
                }
                //Create the view after the types have been initialized
                this.view = this.frame.create(this.conf.components.Object);
                this.view.start(this.types[this.conf.objectType]);
                this.view.file =  this.conf.dataSource;
                this.frame.append(this.view);
                if (this.data) this.receive("view");
            },
			"initializeData": function initializeData(msg) {
                let data = JSON.parse(msg.response);
                let converter = this[Symbol.for("owner")].create(this.conf.dataConverter);
                data = converter.convert(data);
                console.debug(data);
                this.data = data; // this.create(data);
                if (this.view) this.receive("view");
            }
		}
	}
}
return pkg;
}

function workbench() {
	const pkg = {
	"type$": "/ui/panel",
	"type$tree": "/ui/tree",
	"type$tabs": "/ui/tabs",
	"type$Shape": "/ui/shape/Shape",
	"ArticleView": {
		"type$": "/workbench/Display"
	},
	"ArticleModel": {
		"id": "",
		"title": "",
		"type": ""
	},
	"Dyna": {
		"panels": {
			"sidebar": "sidebar/name",
			"": ""
		}
	},
	"App": {
		"type$": "/workbench/App"
	},
	"Workbench": {
		"type$": "/workbench/Section",
		"nodeName": "main",
		"direction": "horizontal",
		"members": {
			"type$header": "/workbench/Display",
			"type$body": "/workbench/workbenchBody",
			"type$footer": "/workbench/workbenchFooter"
		}
	},
	"workbenchFooter": {
		"type$": "/workbench/Display"
	},
	"workbenchBody": {
		"type$": "/workbench/tabs/Tabs",
		"display": function display() {
            this.super(display);
            let content = this.add("Test", this.owner.create("/workbench/content"));
            this.activate(content);
        }
	},
	"content": {
		"type$": "/workbench/tabs/Tabs",
		"display": function display() {
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
	"context": {
		"type$": "/workbench/Display",
		"add": function add(icon) {
            let button = this.owner.create("/ui/pen/Image");
            this.append(button);
            return button;
        },
		"display": function display() {
            this.super(display);
            this.add("/res/icons/folder.svg");
        }
	},
	"sidebar": {
		"type$": ["/workbench/Structure", "/workbench/Shape"],
		"members": {
			"tree": {
				"type$": "/workbench/Collection",
				"type$contentType": "/workbench/tree/Item"
			},
			"value": {
				"type$": ["/workbench/Display", "/workbench/Shape"],
				"nodeName": "pre",
				"zones": {
					"border": {
						"top": 8
					},
					"cursor": {
						"TC": "ns-resize"
					},
					"subject": {
						"TC": "size"
					}
				},
				"extend$actions": {
					"showValue": function showValue(event) {
                        this.peer.innerText = event.value;
                    },
					"size": function size(event) {
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
		"zones": {
			"border": {
				"right": 4
			},
			"cursor": {
				"CR": "ew-resize"
			},
			"subject": {
				"CR": "size"
			}
		},
		"extend$actions": {
			"showValue": function showValue(event) {
                this.owner.send(this.parts.value, event);
            },
			"size": function size(event) {
                if (event.track == this) {
                    let r = this.bounds;
                    this.bounds = {
                        width: event.clientX - r.left
                    }
                }
            }
		}
	}
}
return pkg;
}

