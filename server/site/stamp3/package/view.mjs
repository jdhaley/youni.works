export default {
	package$: "youni.works/view",
	use: {
		package$base: "youni.works/base"
	},
	Viewer: {
		super$: "use.base.Controller",
		type$app: "Application",
		create: function(owner, data) {
			let nodeName = this.nodeName;
			if (typeof nodeName == "function") nodeName = this.nodeName(data);
			let control = owner.createNode(nodeName, this.events);
			this.control(control);
			this.bind(control, data);
			return control;
		},
		nodeName:"div",
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
	Property: {
		super$: "Viewer",
		type$comp: "Component",
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
	Component: {
		super$: "Viewer",
		conf: {
			properties: ""
		},
		properties: null,
		bind: function(view, data) {
			this.app.observe(view, data)
			view.model = data;
		},
		draw: function(view) {
			view.className = this.name;
		},
		display: function(view) {
			view.textContent = "";
			view.parts = this.sys.extend();
			for (let prop of this.properties) {
				let part = prop.create(view.owner, view.model);
				view.parts[prop.name] = part;
				view.append(part);			
			}
		}
	},
	Application: {
		super$: "use.base.Context",
		use: {
			type$Frame: "Frame",
			type$Component: "Component"
		},
		components: null,
		mainFrame: null,
		initialize: function(types) {
			this.sys.define(this, "mainFrame", this.frame(this.conf.window || window));
			this.sys.define(this, "components", this.sys.extend());
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
		type$app: "Application",
		window: null,
		get$view: function() {
			return this.window.document.body;
		},
		initialize: function() {
			this.window.styles = createStyleSheet(this.window.document);
		},
		createNode: function(name, events) {
			let node;
			if (name.indexOf("/") >= 0) {
				let idx = name.lastIndexOf("/");
				node = this.window.document.createElementNs(name.substring(0, idx), name.substring(idx + 1));
			} else {
				node = this.window.document.createElement(name);
			}
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
			let type = this.app.components[viewName]; //TODO if no viewName, read the data for the type/view.
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
	Property: {
		super$: "use.view.Property",
		display: function(view) {
			let type = this.app.components[this.conf.objectType];
			if (view.model.length !== undefined) {
				for (let value of view.model) {
					let content = type.create(view.owner, value);
					view.append(content);
				}
			} else {
				for (let prop of type.properties) {
					let prop = prop.create(view.owner, view.model);
					view.properties[prop.name] = prop;
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
		let component = app.forName(type.view) || app.use.Component;
		component = app.sys.extend(component, {
			app: app,
			name: name,
			properties: []
		});
		if (type.properties) for (let conf of type.properties) {
			let property = viewerOf(app, conf);
			property = app.sys.extend(property, {
				comp: component
			});
			component.properties.push(property);
			property.initialize(conf);
		}
		app.components[name] = component;
		component.initialize(type);
	}
}

function viewerOf(app, conf) {
	if (conf.view) return app.forName(conf.view);
	return app.conf.propertyType[conf.dataType] || app.conf.propertyType.string;
}

//Shaper: {
//	super$: "Viewer",
//	draw: function(view) {
//		view.style.width = view.model.width + view.model.uom;
//		view.style.height = view.model.height + view.model.uom;
//	}
//},
