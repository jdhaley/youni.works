export default {
	type$: "/ui.youni.works/view",
	Property: {
		type$: "View",
		use: {
			type$Naming: "/base.youni.works/util/Naming"
		},
		type$object: "Properties",
		conf: {
			name: "",
			dataType: "",
			caption: "",
			viewWidth: 4
		},
		get$caption: function() {
			return this.conf.caption || this.use.Naming.captionize(this.conf.name);
		},
		display: function() {
			const peer = this.peer;
			const conf = this.conf;
			peer.classList.add("property");
			if (this.conf.dynamic) peer.classList.add("dynamic");
			conf.name && peer.classList.add(conf.name);
			if (this.object.displayType != "row") {
				let label = this.owner.createNode("label");
				label.textContent = this.caption;
				peer.append(label);		
			} else {
			}
			this.editor = this.editorFor();
			peer.append(this.editor);
		},
		get$editorFor: function() {
			//Return the function to create the view's property editor.
			let dataType = this.conf.dataType || typeof this.model;
			let editor = this.owner.editors[dataType] || this.owner.editors["string"];
			return editor;
		},
		bind: function(model) {
			if (this.editor.type) {
				model = model[this.conf.name];
				if (typeof model == "object") model = "[object]";
				if (this.editor.nodeName == "INPUT") {
					this.editor.value = model;
				} else {
					this.editor.textContent = model;
				}
			}
		}
	},
	Properties: {
		type$: "View",
		type$typing: "/base.youni.works/util/Typing",
		displayType: "sheet",
		conf: {
			name: "Object",
			properties: "Nil"
		},
		dynamicProperties: function(object) {
			let superType = Object.create(null);
			for (let prop of this.conf.properties) {
				superType[prop.name] = prop;
			}
			let properties = [];
			for (let name in object) {
				if (!superType[name]) {
					let prop = this.typing.propertyOf(name, object[name]);
					properties.push(prop);
				}
			}
			return properties;
		},
		display: function() {
			const peer = this.peer;
			const conf = this.conf;
			peer.classList.add(this.displayType);
			conf.name && peer.classList.add(conf.name);
			this.displayProperties(conf.properties);
		},
		displayProperties: function(properties) {
			if (!properties) return;
			for (let propConf of properties) {
				let propType = propConf.controlType || "/ui.youni.works/object/Property";
				let prop = this.owner.create(propType, propConf);
				this.sys.define(prop, "object", this);
				this.append(prop);
			}
		},
		bind: function(object) {
			this.unobserve(this.model);
			this.observe(object);
			this.model = object;
		},
		extend$actions: {
			view: function(on, event) {
				let model = on.model;
				on.displayProperties(on.dynamicProperties(model));
				for (let prop of on.to) prop.bind(model);
			}
		}
	},
}