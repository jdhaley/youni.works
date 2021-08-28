export default {
    type$: "/control",
	Viewer: {
		type$: ["Receiver", "Sender"],
		view(model) {
		},
		modelFor(part) {
		},
		extend$actions: {
			view(event) {
				for (let view of this.to) {
					view.view(this.modelFor(view));
				}
			}
		}
	},
	View: {
		type$: ["Viewer", "Sensor"],
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
		part(key) {
			for (let part of this.to) {
				if (part.key == key) return part;
			}
		},
		get$parts() {
			return this.peer.$parts;
		},
		createContent(value, key) {
			let type = this.typeFor(value, key);
			let conf = this.configurationFor(value, key);
			let control = this.owner.create(type, conf);
			this.control(control, key);
			this.append(control);
			return control;
		},
		control(part, key) {
			part.key = key;
			this.parts[key] = part;
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
		},
		modelFor(contentView) {
			return this.members ? this.model : this.model && this.model[contentView.key];
		}
	}
}