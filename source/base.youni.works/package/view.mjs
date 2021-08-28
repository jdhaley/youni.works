export default {
    type$: "/control",	
	View: {
		//A View requires a Node prototype.
		//requires$: "Node",
		var$model: undefined,
		view(data) {
			this.model = data;
		},
		modelFor(contentView) {
			return this.model;
		},
		extend$actions: {
			view(event) {
				for (let view of this.to) {
					view.view(this.modelFor(view));
				}
			}
		}
	},
	Container: {
		type$: "View",
		type$forEach: "util/forEach",
		get$parts() {
			return this.peer.$parts;
		},
		/*
		Currently called in two contexts:
		value is a property of the model
		value is a member of the structure.
		*/
		createContent(value, key) {
			let type = this.typeFor(value, key);
			let conf = this.configurationFor(value, key);
			let control = this.owner.create(type, conf);
			this.control(control, key);
			this.append(control);
			return control;
		},
		control(control, key) {
			control.key = key;
			this.parts[key] = control;
		},
		typeFor(value, key) {
			if (this.members) {
				return this.members[key] ? this.members[key] : "";
			}
			return this.contentType ||  "";
		},
		configurationFor(value, key) {
			return this.conf;
		},
		view(model) {
			this.model = model;
			if (!this.parts) {
				this.peer.$parts = Object.create(null);
				if (this.members) {
					this.forEach(this.members, this.createContent);
				}	
			}
			if (!this.members) {
				this.forEach(model, this.createContent);
			}

			if (this.observe) this.observe(model);
			//array and map:
			
		},
		modelFor(contentView) {
			return this.model && this.model[contentView.key];
		}
	},
	Collection: {
		type$: "Container",
		type$contentType: "View",
		view(model) {
			this.super(view, model);
			this.forEach(model, this.createContent);
		},
		modelFor(contentView) {
			return this.model && this.model[contentView.key];
		},
		typeFor(value, key) {
			return this.contentType;
		},
	},
    Structure: {
		type$: "Container",
		members: {
		},
		// parts: null,
		// view(model) {
		// 	if (!this.parts) {
		// 		this.let("parts", Object.create(null));
		// 		this.forEach(this.members, this.createContent);
		// 	}
		// 	this.model = model;
		// },
		control(part, key) {
			this.super(control, part, key);
			this.parts[key] = part;
		},
		typeFor(value, key) {
			if (value && typeof value == "object") {
				return value.receive ? value : value.contentType || this.contentType;
			}
			return this[Symbol.for("owner")].forName("" + value) || this.contentType;
		},
		configurationFor(value, key) {
			return value && typeof value == "object" && !value.receive ? value : this.conf;
		}
	},
}