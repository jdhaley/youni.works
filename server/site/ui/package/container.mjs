export default {
	type$: "/ui.youni.works/view",
	Part: {
		type$: "",
		get$of: function() {
			return this.peer.parentNode.$peer;
		}
	},
	Container: {
		type$: ["View", "Observer"],
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
		bind: function(model) {
			this.observe(model);
			this.model = model;
		},
		unbind: function() {
			this.unobserve(this.model);
			this.model = undefined;
		}
	},
	Composite: {
		type$: "Container",
		use: {
			type$Part: "Control"
		},
		parts: {
		},
		start: function start(partsConf) {
			this.super(start, partsConf);
			this.sys.define(this, "parts", this.sys.extend(), "const");
			this.forEach(partsConf, this.createPart);
		},
		createPart: function(value, key, object) {
			let name = typeof key == "number" ? value.name : key;
			let part = this.owner.create(this.partTypeOf(value), this.partConfOf(name, value));
			part.peer.$index = key;
			part.peer.classList.add(name);
			this.sys.define(part, "of", this);
			this.parts[name] = part;
			this.append(part);
		},
		partTypeOf: function(value) {
			if (value && typeof value == "object") {
				return value.receive ? value : value.controlType || this.use.Part;
			}
			return this.sys.forName("" + value) || this.use.Part;
		},
		partConfOf: function(name, value) {
			if (value && typeof value == "object" && !value.receive) return value;
		}
	},
	Collection: {
		type$: "Container",
		use: {
			type$Content: "View",
		},
		draw: function() {
			this.peer.textContext = "";
		},
		bind: function bind(model) {
			this.super(bind, model);
			this.forEach(model, this.createElement);
		},
		createElement: function(value, key, object) {
			let content = this.owner.create(this.use.Content, this.conf);
			content.key = key;
			this.append(content);
		},
		start: function start(conf) {
			this.super(start, conf);
			this.sys.define(this, "conf", conf);
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