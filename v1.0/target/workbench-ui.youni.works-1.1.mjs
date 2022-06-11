import system from "./system.youni.works-2.1.mjs";
import base from "./base.youni.works-1.2.mjs";
import ui from "./ui.youni.works-1.1.mjs";
import compiler from "./compiler.youni.works-1.0.mjs";
const module = {
	"name": "workbench-ui.youni.works",
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
	workbench: workbench()
}
const conf = {
	"type$": "/workbench/App",
	"title": "Workbench",
	"data": {
		"test": {
			"type$": "/ui/display/data/DataSource",
			"type$viewType": "/ui/agent/Cell",
			"types": {
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
			},
			"data": {
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
				"issues": [{
						"id": "GB21",
						"issued": "1960-03-01",
						"design": "GB1A",
						"denom": "1d",
						"colors": "black",
						"subject": "",
						"image": "/file/stamp/GB1As.png"
					}, {
						"id": "GB22",
						"issued": "1960-03-01",
						"design": "GB1D",
						"denom": "2d",
						"colors": "blue",
						"subject": "",
						"image": "/file/stamp/GB1Ds.png"
					}, {
						"id": "GB23",
						"issued": "1960-03-01",
						"design": "GB1A",
						"denom": "3d",
						"colors": "red",
						"subject": "",
						"image": "/file/stamp/x.png"
					}, {
						"id": "GB24",
						"issued": "1960-03-01",
						"design": "GB1A",
						"denom": "1d",
						"colors": "black",
						"subject": "",
						"image": "/file/stamp/GB1As.png"
					}, {
						"id": "GB25",
						"issued": "1960-03-01",
						"design": "GB1D",
						"denom": "2d",
						"colors": "blue",
						"subject": "",
						"image": "/file/stamp/GB1Ds.png"
					}, {
						"id": "GB26",
						"issued": "1960-03-01",
						"design": "GB1A",
						"denom": "3d",
						"colors": "red",
						"subject": "",
						"image": "/file/stamp/x.png"
					}, {
						"id": "GB27",
						"issued": "1960-03-01",
						"design": "GB1A",
						"denom": "1d",
						"colors": "black",
						"subject": "",
						"image": "/file/stamp/GB1As.png"
					}, {
						"id": "GB28",
						"issued": "1960-03-01",
						"design": "GB1D",
						"denom": "2d",
						"colors": "blue",
						"subject": "",
						"image": "/file/stamp/GB1Ds.png"
					}, {
						"id": "GB29",
						"issued": "1960-03-01",
						"design": "GB1A",
						"denom": "3d",
						"colors": "red",
						"subject": "",
						"image": "/file/stamp/x.png"
					}, {
						"id": "GB210",
						"issued": "1960-03-01",
						"design": "GB1A",
						"denom": "3d",
						"colors": "red",
						"subject": "",
						"image": "/file/stamp/x.png"
					}]
			}
		}
	},
	"frame": {
		"type$": "/ui/agent/Frame",
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
				"dummy": {
					"title": "Dummy",
					"icon": "/res/icons/moon.svg"
				},
				"test": {
					"title": "Test",
					"icon": "/res/icons/activity.svg",
					"body": {
						"type$": "/ui/tabs/Tabs",
						"extend$conf": {
							"views": {
								"table": {
									"title": "Table",
									"icon": "/res/icons/work.svg",
									"body": {
										"type$": "/ui/display/views/Table",
										"extend$conf": {
											"data": {
												"source": "test",
												"view": "Issue",
												"set": "issues"
											}
										}
									}
								},
								"note": {
									"title": "Note",
									"icon": "/res/icons/book.svg",
									"type$body": "/ui/note/Note"
								},
								"draw": {
									"title": "Draw",
									"icon": "/res/icons/photo.svg",
									"type$body": "/ui/pen/Canvas"
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
				}
			}
		}
	},
	"conf": {
		"type$events": "/ui/events",
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
function workbench() {
	const pkg = {
	"type$": "/ui/agent",
	"App": {
		"type$": ["/workbench/Component", "/workbench/Receiver", "/base/origin/Origin"],
		"start": function start() {
            console.log("Starting application", this[Symbol.for("owner")]);
            let conf = this.conf;
            this.define(this.frame, "app", this);
            this.frame.start(this.conf);
        }
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
				"type$": "/ui/tabs/Tabs",
				"extend$conf": {
					"tabType": "/workbench/WorkbenchTab"
				}
			},
			"footer": {
				"type$": "/workbench/Display"
			}
		},
		"modelFor": function modelFor(key) {
            if (key == "body") return this.conf.views;
        }
	},
	"WorkbenchTab": {
		"type$": "/ui/tabs/Tab"
	}
}
return pkg;
}

