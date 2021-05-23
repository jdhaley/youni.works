export default {
	type$: "/ui.youni.works/view",
	Composite: {
		type$: ["View", "Observer"],
		use: {
			type$Part: "Control"
		},
		parts: {
		},
		start: function start(partsConf) {
			this.super(start, partsConf);
			this.sys.define(this, "parts", this.sys.extend());
			this.createParts(partsConf);
		},
		createParts: function(parts) {
			if (parts[Symbol.toStringTag] == "Array") {
				for (let i = 0, length = parts.length; i < length; i++) {
					this.createPart(parts[i].name, parts[i]);
				}
			} else {
				for (let name in parts) {
					this.createPart(name, parts[name]);
				}	
			}
		},
		createPart: function(name, value) {
			let part = this.owner.create(this.partTypeOf(value), this.partConfOf(name, value));
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
		type$: ["View", "Observer"],
		use: {
			type$Content: "View",
		},
		display: function() {
			this.peer.textContext = "";
		},
		bind: function(model) {
			this.unobserve(this.model);
			this.observe(model);
			this.model = model;
			if (model) for (let i = 0, count = model.length; i < count; i++) {
				let content = this.owner.create(this.use.Content, this.conf);
				content.key = i;
				this.append(content);
			}
		},
		start: function start(conf) {
			this.super(start, conf);
			this.sys.define(this, "conf", conf);
		}
	}
}