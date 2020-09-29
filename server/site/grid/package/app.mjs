const observers = Symbol("observers");
let MOVE = null;
let MOUSE_TARGET = null;
let zIndex = 1;

export default {
	package$: "youni.works/base/app",
	use: {
		package$command: "youni.works/base/command",
		package$remote: "youni.works/web/remote",
		package$view: "youni.works/base/view",
		package$container: "youni.works/base/container",
		package$cell: "youni.works/base/cell",
	},
	Application: {
		super$: "use.view.View",
		use: {
			type$Command: "use.command.Command",
			type$Commands: "use.command.ObjectCommands",
			type$Properties: "use.cell.Properties",
			type$Table: "use.cell.Table",
			type$Window: "Window"
		},
		viewName: "main.application",
		type$remote: "use.remote.Remote",
		open: function(pathname, receiver) {
			this.remote.service(receiver, "opened", {
				url: pathname,
				method: "GET"
			});
		},
		save: function(pathname, content, receiver) {
			this.remote.service(receiver, "saved", {
				url: pathname,
				content: content,
				method: "PUT"
			});
		},
		control: function(view) {
			view.commands = this.sys.extend(this.use.Commands, {
				lastCommand: this.sys.extend(this.use.Command, {
					prior: null,
					next: null
				})
			});
		},
		show: function(app, type, model, datatype) {
			type = app && app.types && app.types[type];
			
			if (!datatype) {
				if (model.length !== undefined) {
					datatype = "array";
				} else if (type) {
					datatype = "object";
				} else {
					datatype = "map";
				}
			}
			let editor = datatype == "object" ? this.use.Properties : this.use.Table;
			editor = this.sys.extend(editor, {
				fields: type
			});
			let window = this.use.Window.createView(app);
			editor.createView(window.body, model, editor.fields);
			window.focus();
			return window;
		},
		extend$events: {
			input: UP,
			keydown: UP,
			click: UP,
			contextmenu: UP,
			cut: UP,
			paste: UP,
			copy: function(event) {
				event.preventDefault();
				let app = event.currentTarget;
				app.controller.owner.setClipboard(event.clipboardData, app);
			},
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
		extend$shortcuts: {
			s: function(on, event) {
				if (!event.ctrlKey) return;
				event.preventDefault();
				this.save(on.path, on.model);
			},
			z: function(on, event) {
				if (!event.ctrlKey) return;
				event.preventDefault();
				on.commands.undo();
			},
			y: function(on, event) {
				if (!event.ctrlKey) return;
				event.preventDefault();
				on.commands.redo();
			}
		}
	},
	Window: {
		super$: "use.container.Item",
		viewName: ".window",
		events: {
			focus: function(event) {
				event.target.controller.activate(event.target);
			}
		},
		control: function(view) {
			view.tabIndex = "0";
			this.activate(view);
		},
		activate: function(view) {
			let current = view.ownerDocument.querySelector(".active");
			if (view == current) return;
			if (current) {
				view.priorWindow = current;
				current.classList.remove("active");
			}
			view.classList.add("active");
			view.style.zIndex = ++zIndex;
		},
		startMove: function(window, target) {
			return target == window.header;	
		},
		createHeader: function(window, model) {
			return this.owner.append(window, "header.header");
		},
		createBody: function(window, model) {
			return this.owner.append(window, "section.body",);
		},
		extend$actions: {
			keydown: function(on, event) {
				if (event.key == "Escape") {
					if (on.priorWindow) on.priorWindow.controller.activate(on.priorWindow);
					on.style.display = "none";
					return;
				}
			}
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
