export default {
	package$: "youni.works/view",
	use: {
		package$base: "youni.works/base",
		package$app: "youni.works/app"
	},
	Viewer: {
		super$: "use.base.Controller",
		type$app: "use.app.Application",
		nodeName:"div",
		create: function(owner, data) {
			let nodeName = this.nodeName;
			if (typeof nodeName == "function") nodeName = this.nodeName(data);
			let control = owner.createNode(nodeName);
			owner.addEvents(control, this.events);
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
	}
}