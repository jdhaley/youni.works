export default {
	type$: "/ui.youni.works/view",
	Type: {
		type$: "",
		name: "Type",
		dataType: "undefined",
		controlType: "base.youni.works/control/Control",
	},
	ContainerType: {
		type$: "Type",
		name: "Container",
		dataType: "object",
		controlType: "ui.youni.works/container/Container",
		//The default element type when there is no specific type to create.
		elementType: "base.youni.works/control/Control", 
	},
	CollectionType: {
		type$: "ContainerType",
		name: "Collection",
		controlType: "ui.youni.works/container/Collection",
		//choices... future.
	},
	CompositeType: {
		type$: "ContainerType",
		name: "Composite",
		controlType: "ui.youni.works/container/Composite",
		members: []
	},
	// Element: {
	// 	type$: "",
	// 	get$of: function() {
	// 		return this.peer.parentNode.$peer;
	// 	},
	// 	get$key : function() {
	// 		return this.peer.$key;
	// 	}
	// },
	// Member: {
	// 	type$: "Element",
	// 	get$name: function() {
	// 		return this.peer.$name;
	// 	}
	// },
	Container: {
		type$: ["View", "Observer"],
		// use: {
		// 	type$Element: "Element"		//The Element interface to use for contained controls.
		// },
		type$type: "Type",
		start: function start(conf) {
			this.super(start, conf);
			this.set("conf", conf);
		},
		forEach: function(object, method) {
			if (object && typeof object.length == "number") {
				for (let i = 0, length = object.length; i < length; i++) {
					method.call(this, object[i], i, object);
				}
			} else {
				for (let name in object) {
					method.call(this, object[name], name, object);
				}
			}
		},
		createElement: function(value, key, object) {
			let type = this.typeFor(value);
			let conf = this.configurationFor(value);
			let control = this.owner.create(type, conf);
			control.peer.$key = key;
			this.append(control);
			return control;
		},
		// append: function append(control) {
		// 	this.super(append, control);
		// 	this.sys.implement(control, this.use.Element[this.sys.symbols.interface]);
		// },
		configurationFor: function (key, value) {
			return this.conf;
		},
		typeFor: function(value) {
			if (value && typeof value == "object") {
				return value.receive ? value : value.controlType || this.conf.elementType;
			}
			return this.sys.forName("" + value) || this.conf.elementType;
		},
		draw: function draw() {
			this.super(draw);
			if (this.conf.name) this.peer.classList.add(this.conf.name);
		},
		bind: function(model) {
			this.observe(model);
			this.model = model;
		},
		unbind: function() {
			this.unobserve(this.model);
			this.model = undefined;
		}
	},
	Collection: {
		type$: "Container",
		type$type: "CollectionType",
		draw: function() {
			//Collection views are "model driven" so content will be created by bind().
			this.peer.textContext = "";
		},
		bind: function bind(model) {
			this.super(bind, model);
			this.forEach(model, createElement);
		}
	},
	Composite: {
		type$: "Container",
		type$type: "CompositeType",
		// use: {
		// 	type$Element: "Member"
		// },
		parts: {
		},
		start: function start(conf) {
			this.super(start, conf);
			this.set("parts", this.sys.extend(), "const");
		},
		draw: function draw() {
			this.super(draw);
			this.forEach(this.conf.members);
		},
		append: function append(control) {
			this.super(append, control);
			let key = control.peer.$key;
			control.peer.classList.add(key);
			this.parts[key] = control;
		},
		configurationFor: function (value) {
			return typeof value == "object" ? value : null;
		},
		typeFor: function(value) {
			if (value && typeof value == "object") {
				return value.receive ? value : value.controlType || this.conf.elementType;
			}
			return this.sys.forName("" + value) || this.conf.elementType;
		},
	},
	TypeView: {
		type$: "",
		type$type: "Type",
		start: function start(type) {
			this.super(start);
			this.sys.define(this, "type", type);
		},
		partConfOf: function(name) {
			return this.type;
		}
	}
}