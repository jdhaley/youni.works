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
		type$conf: "Decl",
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
		display: function() {
			const peer = this.peer;
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
				let propType = propConf.controlType || "/ui.youni.works/object/Part";
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
			view: function(event) {
				let model = this.model;
				this.displayProperties(this.dynamicProperties(model));
				for (let prop of this.to) prop.bind(model);
			}
		}
	},
	Grid: {
		type$: ["View", "Observer"],
		use: {
			type$Header: "Header",
			type$Row: "Row",
			type$Cell: "Cell"
		},
		conf: {
			name: "Object",
			properties: []
		},
		display: function() {
			this.super("display");
			this.header = this.owner.create(this.use.Header, this.conf);
			this.append(this.header);
		},
	},
	Header: {
		type$: "View",
		use: {
			type$Column: "Column",
		},
		display: function () {
			this.super("display");
			for (let prop of this.conf.properties) {
				let column = this.owner.create(this.use.Column, prop);
				this.append(column);		
			}
		}
	},
	Column: {
		type$: "View",
		use: {
			type$Naming: "/base.youni.works/util/Naming"
		},
		getCaption: function() {
			return this.conf.caption || this.use.Naming.captionize(this.conf.name);
		},
		display: function(properties) {
			this.super("display");
			this.peer.innerText = this.getCaption();
		}
	},
	Row: {
		type$: "View",
		use: {
			type$Cell: "Cell",
		},
		display: function () {
			this.super("display");
			for (let prop of this.conf.properties) {
				let cell = this.owner.create(this.use.Cell, prop);
				this.append(cell);		
			}
		}
	},
	Cell: {
		type$: "View",
		display: function() {
			this.super("display");
		},
		bind: function(model) {
			model = model[this.conf.name];
			if (typeof model == "object") model = "...";
			this.peer.textContent = model;
		}
	}
}