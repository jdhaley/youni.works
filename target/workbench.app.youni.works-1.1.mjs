import system from "./system.youni.works-2.1.mjs";
import base from "./base.youni.works-1.2.mjs";
import ui from "./ui.youni.works-1.1.mjs";
import compiler from "./compiler.youni.works-1.0.mjs";
const module = {
	"name": "workbench.app.youni.works",
	"version": "1.1",
	"moduleType": "ui"
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
			"views": {
				"test": {
					"title": "Test",
					"icon": "/res/icons/activity.svg",
					"body": {
						"type$": "/ui/tabs/Stack",
						"extend$conf": {
							"views": {
								"draw": {
									"title": "Draw",
									"icon": "/res/icons/photo.svg",
									"type$body": "/ui/pen/Canvas"
								},
								"note": {
									"title": "Note",
									"icon": "/res/icons/book.svg",
									"type$body": "/ui/note/Note"
								},
								"table": {
									"title": "Table",
									"icon": "/res/icons/work.svg",
									"body": {
										"type$": "/ui/grid/Table",
										"extend$conf": {
											"type$types": "/workbench/types",
											"type$data": "/workbench/data"
										}
									}
								},
								"tree": {
									"title": "Tree",
									"icon": "/res/icons/folder-open.svg",
									"body": {
										"type$": "/ui/tree/Item"
									}
								}
							}
						},
						"view": function view() {
				this.super(view, this.conf.views);
				this.activate();
			}
					}
				},
				"dummy": {
					"title": "Dummy",
					"icon": "/res/icons/moon.svg"
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
	"type$tabs": "/ui/tabs",
	"type$tree": "/ui/tree",
	"type$Shape": "/ui/shape/Shape",
	"ArticleView": {
		"type$": "/workbench/Display"
	},
	"Article": {
		"type$": "/workbench/Display",
		"type$origin": "/base/origin/Origin",
		"start": function start(conf) {
            this.origin.open(this.location)
        },
		"extend$actions": {
			"opened": function opened(message) {
                console.log(message);
            }
		}
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
		"type$": "/workbench/Display",
		"nodeName": "main",
		"extend$conf": {
			"views": {
			}
		},
		"members": {
			"header": {
				"type$": "/workbench/Display"
			},
			"body": {
				"type$": "/workbench/tabs/Stack",
				"extend$conf": {
					"indexType": "/workbench/WorkbenchTab"
				}
			},
			"footer": {
				"type$": "/workbench/Display"
			}
		},
		"modelFor": function modelFor(part) {
            if (part == this.parts.body) return this.conf.views;
        }
	},
	"WorkbenchTab": {
		"type$": "/workbench/tabs/Tab"
	},
	"sidebar": {
		"type$": ["/workbench/Display", "/workbench/Shape"],
		"members": {
			"tree": {
				"type$": "/workbench/Display",
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
	},
	"types": {
		"Design": {
			"members": [{
					"name": "id",
					"columnSize": 4
				}, {
					"name": "shape",
					"columnSize": 4,
					"choice": {
						"r": "Rectangle",
						"t": "Triangle",
						"d": "Diamond",
						"o": "Oval",
						"x": "Irregular"
					}
				}, {
					"name": "width",
					"dataType": "number",
					"columnSize": 4
				}, {
					"name": "height",
					"dataType": "number",
					"columnSize": 4
				}]
		},
		"Issue": {
			"members": [{
					"name": "issued",
					"dataType": "date",
					"columnSize": 4,
					"flex": false
				}, {
					"name": "design",
					"columnSize": 3,
					"flex": false,
					"dataType": "link",
					"objectType": "Design",
					"dataset": "Design",
					"readOnly": false
				}, {
					"name": "denom",
					"caption": "Denomination",
					"columnSize": 4
				}, {
					"name": "colors",
					"columnSize": 2,
					"flex": false,
					"inputType": "color"
				}, {
					"name": "subject",
					"columnSize": 6
				}, {
					"name": "image",
					"dataType": "media",
					"mediaType": "image",
					"columnSize": 8
				}]
		}
	},
	"data": {
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
			"GB22": {
				"issued": "1960-03-01",
				"design": "GB1D",
				"denom": "2d",
				"colors": "blue",
				"subject": "",
				"image": "/file/stamp/GB1Ds.png"
			},
			"GB23": {
				"issued": "1960-03-01",
				"design": "GB1A",
				"denom": "3d",
				"colors": "red",
				"subject": "",
				"image": "/file/stamp/x.png"
			},
			"GB24": {
				"issued": "1960-03-01",
				"design": "GB1A",
				"denom": "1d",
				"colors": "black",
				"subject": "",
				"image": "/file/stamp/GB1As.png"
			},
			"GB25": {
				"issued": "1960-03-01",
				"design": "GB1D",
				"denom": "2d",
				"colors": "blue",
				"subject": "",
				"image": "/file/stamp/GB1Ds.png"
			},
			"GB26": {
				"issued": "1960-03-01",
				"design": "GB1A",
				"denom": "3d",
				"colors": "red",
				"subject": "",
				"image": "/file/stamp/x.png"
			},
			"GB27": {
				"issued": "1960-03-01",
				"design": "GB1A",
				"denom": "1d",
				"colors": "black",
				"subject": "",
				"image": "/file/stamp/GB1As.png"
			},
			"GB28": {
				"issued": "1960-03-01",
				"design": "GB1D",
				"denom": "2d",
				"colors": "blue",
				"subject": "",
				"image": "/file/stamp/GB1Ds.png"
			},
			"GB29": {
				"issued": "1960-03-01",
				"design": "GB1A",
				"denom": "3d",
				"colors": "red",
				"subject": "",
				"image": "/file/stamp/x.png"
			},
			"GB210": {
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
return pkg;
}

