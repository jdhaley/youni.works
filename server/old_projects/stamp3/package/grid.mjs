export default {
	package$: "youni.works/grid",
	use: {
		package$app: "youni.works/app"
	},
	Property: {
		super$: "use.app.View",
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
		super$: "use.app.View",
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
				view.className = view.kind.name;
				view.textContent = "";
				view.parts = view.kind.sys.extend();
				this.viewProperties(view);
			},
			viewProperties: function(view) {
				for (let prop of view.kind.properties) {
					let label = view.owner.createNode("label");
					label.textContent = prop.conf.name;
					view.append(label);
					let part = view.owner.create(null, prop)
					part.container = view;
					view.parts[prop.conf.name] = part;
					view.append(part);			
				}
			}
		},
		initialize: function() {
			if (!this.conf.properties) return;
			let properties = [];
			for (let conf of this.conf.properties) {
				let property = this.app.createController(conf, this.app.propertyType[conf.dataType || "string"]);
				this.sys.define(property, "comp", this);
				properties.push(property);
			}
			this.sys.define(this, "properties", properties);
		}
	}
}