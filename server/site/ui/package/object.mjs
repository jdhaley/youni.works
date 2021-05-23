export default {
	type$: "/ui.youni.works/view",
	UserInterface: {
		type$: "",
		
		dataType: "object",
		properties: {}
	},
	Decl: {
		use: {
			type$Naming: "/base.youni.works/util/Naming"
		},
		type$: "",
		name: "",
		dataType: "",
		get$caption: function() {
			return this.use.Naming.captionize(this.name);
		},
		viewWidth: 4
	},
	Part: {
		type$: "View",
		use: {
			type$Naming: "/base.youni.works/util/Naming"
		},
		type$object: "Properties",
		conf: null,
		get$desc: function() {
			return this.conf;
		},
		getCaption: function() {
			return this.desc.caption || this.use.Naming.captionize(this.desc.name);
		},
		displayEditor: function() {
			//Return the function to create the view's property editor.
			let dataType = this.desc.dataType || typeof this.model;
			let editor = this.owner.editors[dataType] || this.owner.editors["string"];
			return editor.call(this);
		},
		draw: function() {
			const peer = this.peer;
			peer.$peer = this;
			peer.classList.add("property");
			if (this.desc.dynamic) peer.classList.add("dynamic");
			this.desc.name && peer.classList.add(this.desc.name);
			if (this.object.displayType != "row") {
				let label = this.owner.createNode("label");
				label.textContent = this.getCaption();
				peer.append(label);		
			} else {
			}
			this.editor = this.displayEditor();
			peer.append(this.editor);
		},
		bind: function(model) {
			if (this.editor.type) {
				model = model[this.desc.name];
				if (typeof model == "object") model = "[object]";
				if (this.editor.nodeName == "INPUT") {
					this.editor.value = model;
				} else {
					this.editor.textContent = model;
				}
			}
		},
		start: function start(conf) {
			this.super(start, conf);
			if (conf) this.sys.define(this, "conf", conf);
		}
	},
	Properties: {
		type$: ["View", "Observer"],
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
		draw: function() {
			const peer = this.peer;
			const conf = this.conf;
			peer.$peer = this;
			peer.classList.add(this.displayType);
			conf.name && peer.classList.add(conf.name);
			this.displayProperties(conf.properties);
		},
		displayProperties: function(properties) {
			if (!properties) return;
			for (let propConf of properties) {
				let propType = propConf.controlType || "/ui.youni.works/object/Part";
				let prop = this.owner.create(propType, propConf);
				this.sys.define(prop, "object", this);
				this.append(prop);
			}
		},
		bind: function(model) {
			this.unobserve(this.model);
			this.observe(model);
			this.model = model;
			this.displayProperties(this.dynamicProperties(model));
		},
		start: function start(conf) {
			this.super(start, conf);
			if (conf) this.sys.define(this, "conf", conf);
		},
		extend$actions: {
			// view: function(event) {
			// 	let model = this.model;
			// 	this.displayProperties(this.dynamicProperties(model));
			// 	for (let prop of this.to) prop.bind(model);
			// }
		}
	}
}