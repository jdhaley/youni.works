export default {
	type$: "/ui.youni.works/view",
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
			this.unobserve(this.model);
			this.observe(model);
			this.model = model;
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
			this.sys.define(this, "parts", this.sys.extend());
			this.forEach(partsConf, this.createPart);
		},
		createPart: function(value, index, object) {
			let name = typeof index == "number" ? value.name : index;
			let part = this.owner.create(this.partTypeOf(value), this.partConfOf(name, value));
			part.peer.$index = index;
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
			if (model) for (let i = 0, count = model.length; i < count; i++) {
				let content = this.owner.create(this.use.Content, this.conf);
				content.key = i;
				this.append(content);
			}
		},
		createElement: function(value, key, object) {

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
		type$: ["Composite", "Observer"],
		type$type: "Type",
		conf: {
		},
		start: function start(type) {
			this.sys.define(this, "type", type);
			this.super(start, this.conf);
		},
		bind: function(model) {
			this.unobserve(this.model);
			this.observe(model);
			this.model = model;
		},
		partConfOf: function(name) {
			return this.type;
		}
	}
}