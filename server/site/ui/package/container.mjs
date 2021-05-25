export default {
	type$: "/ui.youni.works/view",
	Content: {
		type$: "",
		get$of: function() {
			return this.peer.parentNode.$peer;
		},
		get$key : function() {
			return this.peer.$key;
		}
	},
	Part: {
		type$: "Content",
		get$name: function() {
			return this.peer.$name;
		}
	},
	Container: {
		type$: ["View", "Observer"],
		use: {
			type$Control: "View",			//The type (or default type) of Control to create.
			type$Content: "Content"		//The Content interface to use for content views.
		},
		forEach: function(object, method) {
			if (method === undefined) method = this.createContent;
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
		createContent: function(value, key, object) {
			let control = this.createControl(value, key, object);
			this.sys.implement(control, this.use.Content[this.sys.symbols.interface])
			this.append(control);
		},
		createControl: function(value, key, object) {
			let control = this.owner.create(this.use.Control);
			control.peer.$key = key;
			return control;
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
		unbind: function unbind() {
			this.super(unbind);
			this.peer.textContext = "";
		},
		bind: function bind(model) {
			this.super(bind, model);
			this.forEach(model);
		},
		createControl: function(value, key, object) {
			let control = this.owner.create(this.use.Control, this.conf);
			control.peer.$key = key;
			return control;
		},
		start: function start(conf) {
			this.super(start, conf);
			this.sys.define(this, "conf", conf);
		}
	},
	Composite: {
		type$: "Container",
		use: {
			type$Control: "View",
			type$Content: "Part"
		},
		parts: {
		},
		start: function start(conf) {
			this.super(start, conf);
			this.sys.define(this, "conf", conf);
			this.sys.define(this, "parts", this.sys.extend(), "const");
			this.forEach(conf);
		},
		createControl: function(value, key, object) {
			let name = typeof key == "number" ? value.name : key;
			let control = this.owner.create(this.partTypeOf(value), this.partConfOf(name, value));
			control.peer.$key = key;
			control.peer.$name = name;
			control.peer.classList.add(name);
			this.parts[name] = control;
			return control;
		},
		partTypeOf: function(value) {
			if (value && typeof value == "object") {
				return value.receive ? value : value.controlType || this.use.Control;
			}
			return this.sys.forName("" + value) || this.use.Control;
		},
		partConfOf: function(name, value) {
			if (value && typeof value == "object" && !value.receive) return value;
		}
	},
	Type: {
		name: "Object",
		properties: null
	},
	TypeView: {
		type$: "Composite",
		type$type: "Type",
		conf: {
		},
		start: function start(type) {
			this.sys.define(this, "type", type);
			this.super(start, this.conf);
		},
		partConfOf: function(name) {
			return this.type;
		}
	}
}