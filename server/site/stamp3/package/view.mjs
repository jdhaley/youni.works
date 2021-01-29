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
			//This is where the style & non-model elements get rendered.
		},
		extend$actions: {
			view: function(view, event) {
				this.draw(view);
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
			if (data) view.model = data[this.conf.name];
		},
		draw: function(view) {
			view.className = this.conf.name;
			//view.owner.style(view);
		},
		extend$actions: {
			view: function(view, event) {
				this.draw(view);
				let action = this.actions["view-" + (this.conf.dataType || "String")];
				action && action.call(this, view, event);
			},
			"view-string": function(view, event) {
				view.textContent = view.model;
			},
			"view-object": function(view, event) {
				let type = this.app.viewers[this.conf.objectType];
				if (type) type.fill(view);
			},
			"view-array": function(view, event) {
				let type = this.app.viewers[this.conf.objectType];
				for (let value of view.model) {
					let content = type.create(view.owner, value);
					view.append(content);					
				}
			}
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
			this.sys.define(this, "parts", []);
			for (let part of conf.parts) {
				let viewer = this.app.forName(part.view) || this.use.DefaultView;
				viewer = this.sys.extend(viewer, {
					comp: this
				});
				this.parts.push(viewer);
				viewer.initialize(part);
			}
		},
		draw: function(view) {
			view.className = this.name;
		},
		fill: function(view) {
			view.parts = this.sys.extend();
			for (let part of this.parts) {
				let prop = part.create(view.owner, view.model);
				view.parts[part.name] = prop;
				view.append(prop);			
			}
		},
		extend$actions: {
			view: function(view, event) {
				this.draw(view);
				this.fill(view);
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
			this.conf.types = types;
			this.sys.define(this, "mainFrame", this.frame(this.conf.window || window));
			this.sys.define(this, "viewers", this.sys.extend());
			for (let name in types) {
				let type = types[name];
				let viewer = this.forName(type.view) || this.use.DefaultView;
				viewer = this.sys.extend(viewer, {
					app: this,
					name: name
				});
				this.viewers[name] = viewer;
				viewer.initialize(type);
			}
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
			out += defineProperties("", properties);
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

function createStyleSheet(document) {
	let ele = document.createElement("style");
	ele.type = "text/css";
	document.head.appendChild(ele);
	return ele.sheet;
}

function defineProperties(prefix, object) {
	let out = "";
	for (let name in object) {
		let value = object[name];
		if (typeof value == "object") {
			out += defineProperties(prefix + name + "-", value);
		} else {
			out += "\t" + prefix + name + ": " + value + ";\n"
		}
	}
	return out;
}

//Shaper: {
//	super$: "Viewer",
//	draw: function(view) {
//		view.style.width = view.model.width + view.model.uom;
//		view.style.height = view.model.height + view.model.uom;
//	}
//},
