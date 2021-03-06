export default {
	package$: "youni.works/app",
	use: {
		package$base: "youni.works/base"
	},
	Application: {
		super$: "use.base.Application",
		type$mainFrame: "Frame",
		components: null,
		propertyType: null,
		events: null,
		conf: null,
		frame: function(window) {
			if (!window.owner) {
				window.owner = this.sys.extend(this.use.Frame, {
					app: this,
					window: window
				});
				window.owner.initialize();
			}
			return window.owner;
		},
		initialize: function(conf) {
			console.log(this);
			this.sys.define(this, "events", conf.events);
			this.sys.define(this, "mainFrame", this.frame(conf.window));
			this.open(this.mainFrame.search + ".json", initializeApp);
			let app = this;
			function initializeApp(msg) {
				let conf = JSON.parse(msg.content);
				conf = app.sys.extend(null, conf);
				app.sys.define(app, "conf", conf);
				app.open(conf.typeSource, initializeTypes);
				app.mainFrame.initialize();
			}
			function initializeTypes(msg) {
				let components = JSON.parse(msg.content);
				app.sys.define(app, "components", app.sys.extend());
				for (let conf of components) {
					app.components[conf.name] = app.createController(conf);
				}
				app.open(app.conf.dataSource, initializeData);
				app.open(app.conf.diagram, initializeDiagram)
			}
			function initializeDiagram(msg) {
				let data = JSON.parse(msg.content);
				data = app.sys.extend(null, data);
				app.mainFrame.content.view(data, "youni.works/diagram/Diagram");
			}
			function initializeData(msg) {
				let data = JSON.parse(msg.content);
				data = app.sys.extend(null, data);
				app.mainFrame.content.view(data, app.conf.objectType);
			}
		},
		createController: function(conf, defaultType) {
			conf = this.sys.extend(null, conf);
			let controller = this.forName(conf.type) || defaultType || this.use.Component;
			controller = this.sys.extend(controller, {
				app: this,
				conf: conf
			});
			conf.type = controller;
			controller.initialize();
			return controller;
		}
	},
	Frame: {
		super$: "use.base.Owner",
		type$app: "Application",
		window: null,
		get$activeElement: function() {
			return this.window.document.activeElement;
		},
		get$content: function() {
			return this.window.document.body;
		},
		get$search: function() {
			return this.window.location.search.substring(1);
		},
		get$selectionRange: function() {
			let selection = this.window.getSelection();
			if (selection && selection.rangeCount) {
				return selection.getRangeAt(0);
			}
			return this.window.document.createRange();
		},
		createControl: function(controller, data) {
			let nodeName = controller.nodeNameFor ? controller.nodeNameFor(data) : "div";
			let control = this.createNode(nodeName);
			addEvents(control, controller.events);
			return control;
		},
		createNode: function(name) {
			let node;
			if (name.indexOf("/") >= 0) {
				let idx = name.lastIndexOf("/");
				node = this.window.document.createElementNs(name.substring(0, idx), name.substring(idx + 1));
			} else {
				node = this.window.document.createElement(name);
			}
			node.to = node.childNodes; //allows send() message to be generic.
			return node;
		},
		createRule: function(selector, properties) {
			let out = `${selector} {\n`;
			out += defineStyleProperties(properties);
			out += "\n}";
			let index = this.window.styles.insertRule(out);
			return this.window.styles.cssRules[index];
		},
		initialize: function() {
			this.control(this.window);
			this.control(this.content);
			this.window.Node.prototype.owner = this;
			this.window.Element.prototype.view = view;
			this.window.styles = createStyleSheet(this.window.document);
			addEvents(this.window, this.app.events.windowEvents);
			addEvents(this.window.document, this.app.events.documentEvents);
		}
	},
	View: {
		super$: "use.base.Controller",
		type$app: "Application",
		nodeNameFor: function(data) {
			return "DIV";
		}
	}
}

function view(data, type) {
	let control = this.owner.create(data, type);
	this.append(control);
	this.of.actions.send(control, "view");
}

function addEvents(control, events) {
	for (let name in events) {
		let listener = events[name];
		control.addEventListener(name, listener);
	}
}
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
