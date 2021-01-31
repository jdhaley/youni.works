export default {
	package$: "youni.works/view",
	use: {
		package$base: "youni.works/base"
	},
	Viewer: {
		super$: "use.base.Controller",
		type$app: "App",
		nodeName: "div",
		create: function(owner, data) {
			let control = owner.createNode(this.nodeName, this.events);
			this.control(control);
			this.bind(control, data);
			return control;
		},
		draw: function(view) {
		},
		display: function(view) {
		},
		extend$actions: {
			view: function(view, event) {
				this.draw(view);
				this.display(view);
			}
		},
		extend$events: {
		}
	},
	Part: {
		super$: "Viewer",
		type$comp: "Composite",
		get$app: function() {
			return this.comp.app;
		},
		conf: {
			name: "",
			dataType: "",
			title: "",
			viewWidth: 4
		},
		bind: function(view, data) {
			view.model = undefined;
			if (data) view.model = data[this.conf.name];
		}
	},
	Composite: {
		super$: "Viewer",
		use: {
			type$DefaultView: "Part"
		},
		parts: null,
		bind: function(view, data) {
			this.app.observe(view, data)
			view.model = data;
		},
		initialize: function(conf) {
			this.sys.define(this, "conf", conf);
//			this.sys.define(this, "parts", []);
//			for (let part of conf.parts) {
//				let viewer = this.viewerOf(part);
//				viewer = this.sys.extend(viewer, {
//					comp: this
//				});
//				this.parts.push(viewer);
//				viewer.initialize(part);
//			}
		},
		draw: function(view) {
			view.className = this.name;
		},
		display: function(view) {
			view.textContent = "";
			view.parts = this.sys.extend();
			for (let part of this.parts) {
				let prop = part.create(view.owner, view.model);
				view.parts[part.name] = prop;
				view.append(prop);			
			}
		}
	},
	App: {
		super$: "use.base.Context",
		use: {
			type$Frame: "Frame",
			type$DefaultView: "Composite"
		},
		viewers: null,
		mainFrame: null,
		initialize: function(types) {
			this.sys.define(this, "mainFrame", this.frame(this.conf.window || window));
			this.sys.define(this, "viewers", this.sys.extend());
			defineTypes(this, types);
		},
		frame: function(window) {
			if (!window.frame) {
				window.frame = this.sys.extend(this.use.Frame, {
					app: this,
					window: window
				});
				window.frame.initialize();
			}
			return window.frame;
		}
	},
	Frame: {
		super$: "use.base.Owner",
		type$app: "App",
		window: null,
		get$view: function() {
			return this.window.document.body;
		},
		initialize: function() {
			this.window.styles = createStyleSheet(this.window.document);
		},
		createNode: function(name, events) {
			let node = this.window.document.createElement(name);
			node.owner = this;
			node.to = node.childNodes; //allows send() message to be generic.
			for (let name in events) {
				let listener = events[name];
				node.addEventListener(name, listener);
			}
			return node;
		},
		createRule: function(selector, properties) {
			let out = `${selector} {\n`;
			out += defineProperties(properties);
			out += "\n}";
			let index = this.window.styles.insertRule(out);
			return this.window.styles.cssRules[index];
		},
		display: function(data, viewName) {
			let type = this.app.viewers[viewName]; //TODO if no viewName, read the data for the type/view.
			if (!type) throw new Error(`Type view '${viewName}' does not exist.`);
			let view = type.create(this, data);
			this.view.append(view);
			let message = this.sys.extend(null, {
				topic: "view"
			});
			this.app.send(view, message);
		}
	}
}

/*
	Part: {
		super$: "use.view.Part",
		display: function(view) {
			let type = this.app.viewers[this.conf.objectType];
			if (view.model.length !== undefined) {
				for (let value of view.model) {
					let content = type.create(view.owner, value);
					view.append(content);
				}
			} else {
				for (let part of type.parts) {
					let prop = part.create(view.owner, view.model);
					view.parts[part.name] = prop;
					view.append(prop);			
				}
			}
		}
	},

 */
function createStyleSheet(document) {
	let ele = document.createElement("style");
	ele.type = "text/css";
	document.head.appendChild(ele);
	return ele.sheet;
}

function defineProperties(object, prefix) {
	if (!prefix) prefix = "";
	let out = "";
	for (let name in object) {
		let value = object[name];
		if (typeof value == "object") {
			out += defineProperties(value, prefix + name + "-");
		} else {
			out += "\t" + prefix + name + ": " + value + ";\n"
		}
	}
	return out;
}

function defineTypes(app, types) {
	for (let name in types) {
		let type = types[name];
		let viewer = app.forName(type.view) || app.use.DefaultView;
		viewer = app.sys.extend(viewer, {
			app: app,
			name: name,
			parts: []
		});
		if (type.parts) for (let part of type.parts) {
			let field = viewerOf(app, part);
			field = app.sys.extend(field, {
				comp: viewer
			});
			viewer.parts.push(field);
			field.initialize(part);
		}
		app.viewers[name] = viewer;
		viewer.initialize(type);
	}
}

function viewerOf(app, conf) {
	if (conf.view) return app.forName(part.view);
	return app.conf.part[conf.dataType] || app.conf.part.string;
}

//Shaper: {
//	super$: "Viewer",
//	draw: function(view) {
//		view.style.width = view.model.width + view.model.uom;
//		view.style.height = view.model.height + view.model.uom;
//	}
//},
