export default {
	package$: "youni.works/app",
	use: {
		package$base: "youni.works/base"
	},
	View: {
		super$: "use.base.Control",
		once$view: function() {
			let view = this.owner.createNode("div");
			view.$ctl = this;
			return view;
		},
		once$to: function() {
			const nodes = this.view.childNodes;
			return this.sys.extend(null, {
				"@iterator": function* iterate() {
					for (let i = 0, len = nodes.length; i < len; i++) {
						let view = nodes[i];
						if (view.$ctl) yield view.$ctl;
					}
				}				
			});
		},
		append: function(control) {
			this.view.append(control.view);
		},
		draw: function(data) {
			this.bind(data);
			this.actions.send(this, "view");
		},
		bind: function(data) {
		},
		start: function() {
			//addEvents(view, type.events);
		}
	},
	Frame: {
		super$: "use.base.Owner",
		use: {
			type$Control: "View"
		},
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
		create: function(type) {
			if (typeof type != "object") type = this.app.forName(type);
			let control = this.sys.extend(type, {
				owner: this,
				model: null
			});
			control.start();
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
			console.log(this.toPixels("1mm"), this.toPixels("1pt"), this.toPixels("1in"));
//			this.control(this.window);
//			this.control(this.content);
//			this.window.Element.prototype.view = view;

			this.window.Node.prototype.owner = this;
			this.window.styles = createStyleSheet(this.window.document);
			addEvents(this.window, this.app.events.windowEvents);
			addEvents(this.window.document, this.app.events.documentEvents);
		},
		toPixels: function(measure) {
		    let node = this.createNode("div");
		    node.style.height = measure;
		    this.content.appendChild(node);
		    let px = node.getBoundingClientRect().height;
		    node.parentNode.removeChild(node);
		    return px;
		}
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
			}
			function initializeTypes(msg) {
				let components = JSON.parse(msg.content);
				app.sys.define(app, "components", app.sys.extend());
				for (let conf of components) {
					app.components[conf.name] = app.createController(conf);
				}
			//	app.open(app.conf.dataSource, initializeData);
				app.open(app.conf.diagram, initializeDiagram)
			}
			function initializeDiagram(msg) {
				let data = JSON.parse(msg.content);
				data = app.sys.extend(null, data);
				let view = app.mainFrame.create("youni.works/diagram/Diagram");
				view.file = app.conf.diagram;
				app.mainFrame.content.append(view.view);
				view.draw(data);
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
		//	controller.initialize();
			return controller;
		}
	}
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
