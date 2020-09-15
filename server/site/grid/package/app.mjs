const observers = Symbol("observers");
let MOVE = null;
let MOUSE_TARGET = null;
let zIndex = 1;

export default {
	package$: "youni.works/base/app",
	use: {
		package$command: "youni.works/base/command",
		package$view: "youni.works/base/view",
		package$cell: "youni.works/base/cell",
	},
	Window: {
		super$: "use.view.Item",
		viewName: ".window",
		activate: function(on) {
			let current = on.ownerDocument.querySelector(".active");
			if (on == current) return;
			if (current) current.classList.remove("active");
			on.classList.add("active");
			on.style.zIndex = ++zIndex;
			on.body.focus();		
		},
		startMove: function(window, target) {
			return target == window.header;	
		},
		createHeader: function(window, model) {
			return this.owner.append(window, ".header");
		},
		createBody: function(window, model) {
			return this.owner.append(window, ".body", {
				tabindex: "0"
			});
		}
	},
	Application: {
		super$: "use.view.Viewer",
		use: {
			type$Command: "use.command.Command",
			type$Commands: "use.command.ObjectCommands",
			type$Properties: "use.cell.Properties",
			type$Table: "use.cell.Table",
			type$Map: "use.cell.Map",
			type$Window: "Window"
		},
		viewName: "main.application",
		control: function(view) {
			view.commands = this.sys.extend(this.use.Commands, {
				lastCommand: this.sys.extend(this.use.Command, {
					next: null
				})
			});
		},
		extend$events: {
			input: UP,
			keydown: UP,
			click: UP,
			contextmenu: UP,
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
					return;
				}
				if (event.ctrlKey && event.key == "z") {
					event.preventDefault();
					on.commands.undo();
					return;
				}
				if (event.ctrlKey && event.key == "y") {
					event.preventDefault();
					on.commands.redo();
					return;
				}
			}
		},
		show: function(app, type, model, datatype) {
			type = app && app.types && app.types[type];
			
			if (!datatype) {
				if (model.length) {
					datatype = "array";
				} else if (type) {
					datatype = "object";
				} else {
					datatype = "map";
				}
			}
			let editor = this.use.Map;
			switch (datatype) {
				case "array":
					editor = this.use.Table;
					break;
				case "object":
					editor = this.use.Properties;
					break;
			}
			editor = this.sys.extend(editor, {
				fields: type
			});
			let window = this.use.Window.createView(app);
			editor.createView(window.body, model);
			window.focus();
			return window;
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
