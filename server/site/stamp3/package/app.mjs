export default {
	package$: "youni.works/app",
	use: {
		package$base: "youni.works/base"
	},
	Application: {
		super$: "use.base.Context",
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
				conf = app.sys.extend(conf);
				app.sys.define(app, "conf", conf);
				app.open(conf.typeSource, initializeTypes);
				app.mainFrame.initialize();
			}
			function initializeTypes(msg) {
				let types = JSON.parse(msg.content);
				defineTypes(app, types);
				app.open(app.conf.dataSource, initializeData);
			}
			function initializeData(msg) {
				let data = JSON.parse(msg.content);
				data = app.sys.extend(null, data);
				app.start(data);
			}
		},
		start: function(data) {
			this.mainFrame.display(data, this.conf.objectType);
		}
	},
	Frame: {
		super$: "use.base.Owner",
		type$app: "Application",
		window: null,
		get$search: function() {
			return this.window.location.search.substring(1);
		},
		get$view: function() {
			return this.window.document.body;
		},
		initialize: function() {
			this.window.Node.prototype.owner = this;
			this.window.styles = createStyleSheet(this.window.document);
			this.addEvents(this.window, this.app.events.windowEvents);
			this.addEvents(this.window.document, this.app.events.documentEvents);
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
		addEvents: function(node, events) {
			for (let name in events) {
				let listener = events[name];
				node.addEventListener(name, listener);
			}
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

/*
TODO document the initialization sequence.  For example, 
initialize() is called after the controller is added to its owner but before all peers are created.
 */
function defineTypes(app, types) {
	app.sys.define(app, "components", app.sys.extend());
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
	return app.propertyType[conf.dataType] || app.propertyType.string;
}
