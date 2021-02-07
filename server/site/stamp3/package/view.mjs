export default {
	package$: "youni.works/view",
	use: {
		package$base: "youni.works/base"
	},
	Viewer: {
		super$: "use.base.Controller",
		type$app: "Application",
		nodeName:"div",
		create: function(owner, data) {
			let nodeName = this.nodeName;
			if (typeof nodeName == "function") nodeName = this.nodeName(data);
			let control = owner.createNode(nodeName, this.events);
			this.control(control);
			this.bind(control, data);
			return control;
		},
		extend$actions: {
			view: function(view, event) {
				this.draw(view);
				this.display(view);
			},
			draw: function(view) {
			},
			display: function(view) {
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
		extend$actions: {
			view: function(view, event) {
				this.draw(view);
				this.display(view);
			},
			draw: function(view) {
				view.className = this.name;
			},
			display: function(view) {
				view.textContent = "";
				view.parts = view.conf.type.sys.extend();
				this.displayProperties(view);
			},
			displayProperties: function(view) {
				for (let prop of view.conf.type.properties) {
					let label = view.owner.createNode("div");
					label.textContent = prop.conf.name;
					view.append(label);
					let part = prop.create(view.owner, view.model);
					part.container = view;
					view.parts[prop.conf.name] = part;
					view.append(part);			
				}
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
			this.window.document.addEventListener("selectionstart", SELECTION_EVENT);
			this.window.document.addEventListener("selectionchange", SELECTION_EVENT);
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
		},
		extend$events: {
			resize: DOWN,
			input: UP,
			cut: UP,
			copy: UP,
			paste: UP,

			keydown: UP,
			mousedown: UP,
			mouseup: UP,
			mousemove: UP,
			mouseleave: UP,
			click: UP,
			dragstart: UP,
			dragover: UP,
			drop: UP,
			contextmenu: function(event) {
				if (event.ctrlKey) {
					event.preventDefault();
					UP(event);
				}
			}
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

function defineStyleProperties(object, prefix) {
	if (!prefix) prefix = "";
	let out = "";
	for (let name in object) {
		let value = object[name];
		if (typeof value == "object") {
			out += defineStyleProperties(value, prefix + name + "-");
		} else {
			out += "\t" + prefix + name + ": " + value + ";\n"
		}
	}
	return out;
}

/*
TODO document the initialization sequence.  For example, 
initialize() is called after the controller is added to its owner but before all peers are created.
 */
function defineTypes(app, types) {
	for (let name in types) {
		let type = types[name];
		let component = app.forName(type.view) || app.use.Component;
		component = app.sys.extend(component, {
			app: app,
			name: name,
			properties: []
		});
		if (type.properties) defineProperties(component, type.properties)
		app.components[name] = component;
		component.initialize(type);
	}
}
function defineProperties(component, properties) {
	for (let conf of properties) {
		let property = viewerOf(component.app, conf);
		property = component.sys.extend(property, {
			comp: component
		});
		component.properties.push(property);
		property.initialize(conf);
	}
}
function viewerOf(app, conf) {
	if (conf.view) return app.forName(conf.view);
	return app.conf.propertyType[conf.dataType] || app.conf.propertyType.string;
}

function SELECTION_EVENT(event) {
	let selection = event.target.defaultView.getSelection();
	if (selection && selection.rangeCount) {
		event.range = selection.getRangeAt(0);
		let node = event.range.commonAncestorContainer;
		if (node.controller) node.controller.owner.transmit.up(node, event);
//		console.log(node);
	}
}
function UP(event) {
	let controller = event.currentTarget.controller;
	controller && controller.owner.transmit.up(event.target, event);
}

function DOWN(event) {
	let controller = event.currentTarget.controller;
	controller && controller.owner.transmit.down(event.target, event);
}
//Shaper: {
//	super$: "Viewer",
//	draw: function(view) {
//		view.style.width = view.model.width + view.model.uom;
//		view.style.height = view.model.height + view.model.uom;
//	}
//},
