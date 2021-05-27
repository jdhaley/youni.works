export default {
	type$: "/ui.youni.works/view",
	Container: {
		type$: ["View", "Observer"],
		get$elementType: function() {
			return this.conf.elementType;
		},
		bind: function(model) {
			this.observe(model);
			this.model = model;
		},
		unbind: function() {
			this.unobserve(this.model);
			this.model = undefined;
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
			let type = this.typeFor(value, key);
			let conf = this.configurationFor(value, key);
			let control = this.owner.create(type, conf);
			control.peer.$key = this.keyFor(value, key);
			this.append(control);
			return control;
		},
		keyFor: function(value, key) {
			return key;
		},
		typeFor: function(value, key) {
			return this.elementType;
		},
		configurationFor: function(value, key) {
			return this.conf;
		}
	},
	Composite: {
		type$: "Container",
		get$members: function() {
			return this.conf.members;
		},
		parts: {
		},
		start: function start(conf) {
			this.super(start, conf);
			this.let("parts", this.sys.extend(), "const");
		},
		draw: function draw() {
			this.super(draw);
			this.forEach(this.members, this.createElement);
		},
		append: function append(control) {
			this.super(append, control);
			let key = control.peer.$key;
			control.peer.classList.add(key);
			this.parts[key] = control;
		},
		typeFor: function(value, key) {
			if (value && typeof value == "object") {
				return value.receive ? value : value.elementType || this.elementType;
			}
			return this.sys.forName("" + value) || this.elementType;
		},
		configurationFor: function(value, key) {
			return value && typeof value == "object" && !value.receive ? value : this.conf;
		}
	},
	Collection: {
		type$: "Container",
		draw: function() {
			//Collection views are "model driven" so content will be created by bind().
			this.peer.textContext = "";
		},
		bind: function bind(model) {
			this.super(bind, model);
			this.forEach(model, this.createElement);
		},
		bindElement: function(view) {
			view.bind(this.model[view.peer.$key]);
		}
	}
}