export default {
	package$: "youni.works/view",
	use: {
		package$base: "youni.works/base"
	},
	Viewer: {
		super$: "use.base.Controller",
		type$app: "App",
		nodeName: "div",
		create: function(container, data) {
			let view = container.ownerDocument.createElement(this.nodeName);
			view.arc = view.childNodes; //allows send() message to be generic.
			for (let name in this.events) {
				let listener = this.events[name];
				view.addEventListener(name, listener);
			}
			this.control(view);
			this.bind(view, data);
			return view;
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
					let content = type.create(view, value);
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
				let prop = part.create(view, view.model);
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
			type$DefaultView: "Composite"
		},
		viewers: null,
		initialize: function(types) {
			this.conf.types = types;
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
		view: function(container, typeName, data) {
			let type = this.viewers[typeName];
			let view = type.create(container, data);
			container.append(view);
			let message = this.sys.extend(null, {
				topic: "view"
			});
			this.send(view, message);
		}
	}
}
//Shaper: {
//	super$: "Viewer",
//	draw: function(view) {
//		view.style.width = view.model.width + view.model.uom;
//		view.style.height = view.model.height + view.model.uom;
//	}
//},
