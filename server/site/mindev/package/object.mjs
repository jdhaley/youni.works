export default {
	package$: "youni.works/object",
	use: {
		package$view: "youni.works/view"
	},
	Property: {
		super$: "use.view.View",
		type$object: "Object",
		conf: {
			name: "",
			dataType: "",
			title: "",
			viewWidth: 4
		},
		labelFor: function(ele) {
			if (this.object.display == "row") return;
			let label = this.owner.createNode("label");
			label.textContent = this.conf.title || this.conf.name;
			ele.append(label);			
		},
		get$editorFor: function() {
			//Return the function to create the view's property editor.
			let dataType = this.conf.dataType || typeof this.model;
			return this.owner.app.editors[dataType];
		},
		once$view: function() {
			let ele = this.owner.createNode("div");
			ele.classList.add(this.conf.name);
			ele.classList.add(this.display);
			ele.$ctl = this;
			this.labelFor(ele);
			this.editorFor(ele);
			return ele;
		},
		bind: function(model) {
			this.sys.define(this, "model", model && model[this.conf.name]);
		}
	},
	Object: {
		super$: "use.view.View",
		display: "Sheet",
		to: Object.freeze([]),
		conf: {
			properties: Object.freeze([])
		},
		start: function(conf) {
			if (!conf) conf = this.sys.extend(null, {
				name: "Object",
				properties: []
			});
			this.sys.define(this, "conf", conf);
			if (conf.properties) {
				this.sys.define(this, "to", []);
				for (let propConf of conf.properties) {
					let propType = propConf.controlType || "youni.works/object/Property";
					prop = this.owner.create(propType, propConf);
					this.sys.define(prop, "object", this);
					this.to.push(prop);
				}
			}
		},
		extend$actions: {
			view: function(on, event) {
				let view = on.view;
				view.className = on.conf.name;
				for (let prop of on.to) {
					prop.bind(on.model);
					on.append(prop);
				}
			}
		}
	}
}