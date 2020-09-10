const observers = Symbol("observers");
let MOVE = null;
let MOUSE_TARGET = null;
export default {
	package$: "youni.works/base/app",
	use: {
		package$view: "youni.works/base/view",
		package$cell: "youni.works/base/cell",
	},
	Window: {
		super$: "use.view.Item",
		viewName: ".window",
		startMove: function(window, target) {
			return target == window.header;	
		},
		createHeader: function(window, model) {
			return this.owner.append(window, ".header");
		},
		createBody: function(window, model) {
			return this.owner.append(window, ".body");
		}
	},
	Application: {
		super$: "use.view.Viewer",
		viewName: "main.application",
		extend$events: {
			input: UP,
			keydown: UP,
			mousedown: function(event) {
				MOUSE_TARGET = event.target;
				event.mouseTarget = MOUSE_TARGET;
				UP(event, MOUSE_TARGET);
			},
			mouseup: function(event) {
				if (MOUSE_TARGET) {
					event.mouseTarget = MOUSE_TARGET;
					UP(event, MOUSE_TARGET);
					MOUSE_TARGET = null;
				}
			},
			mousemove: function(event) {
				if (MOUSE_TARGET) {
					event.mouseTarget = MOUSE_TARGET;
					UP(event, MOUSE_TARGET);
				}
			},
			mouseleave: function(event) {
				if (MOUSE_TARGET) {
					event.mouseTarget = MOUSE_TARGET;
					UP(event, MOUSE_TARGET);
					MOUSE_TARGET = null;
				}
			}
		},
		extend$actions: {
			keydown: function(on, event) {
				if (event.ctrlKey && event.key == "s") {
					event.preventDefault();
					this.owner.save(on.path, on.model);
				}	
			}
		}
	},
	DataWindow: {
		super$: "Window",
		use: {
			type$cell: "use.cell"
		},
		show: function(parent, type, model) {
			let app = this.owner.getViewContext(parent, "application");
			type = app && app.types && app.types[type];

			let editor;
			if (model.length) {
				editor = this.sys.extend(this.use.cell.Table, {
					record: this.sys.extend(this.use.cell.Record, {
						fields: type
					})
				});
			} else {
				editor = this.sys.extend(this.use.cell.Properties, {
					fields: type
				});
			}
			let view = this.createView(parent, model);
			editor.createView(view.body, model);
			return view;
		}
	}
}

function UP(event, from) {
	let controller = event.currentTarget.controller;
	controller && controller.owner.transmit.up(from || event.target, event);
}

//Factory: {
//	super$: "Object",
//	types: {
//	},
//	bind: function(types) {
//		let ctx = this.sys.extend(this, {
//			extend$types: {}
//		});
//		for (let name in types) {
//			let value = types[name]
//			switch (typeof value) {
//				case "function":
//					ctx.types[name] = value.bind(ctx);
//					break;
//				case "object":
//					if (this.sys.isInterface(value)) {
//						ctx.types[name] = this.sys.extend.bind(this.sys, value);
//					} else if (typeof value.create == "function") {
//						value = Object.create(value);
//						value.context = ctx;
//						ctx.types[name] = value.create.bind(value);
//					}
//					break;
//			}
//		}
//		return ctx.types;
//	}
//},
