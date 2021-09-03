export default {
    type$: "/control",
	Viewer: {
		type$: "Controller",
		view(model) {
		},
		modelFor(part) {
		},
		extend$actions: {
			view(event) {
				for (let part of this.to) {
					part.view(this.modelFor(part));
				}
			}
		}
	},
	Container: {
		type$: "Viewer",
		xxxxforEach(value, method, methodObject) {
            if (!methodObject) methodObject = this;
            if (value && value[Symbol.iterator]) {
                let i = 0;
                for (let datum of value) {
                    method.call(methodObject, datum, i++, value);
                }
            } else if (typeof value == "object") {
                for (let name in value) {
                    method.call(methodObject, value[name], name, value);
                }
            }
            // } else {
            //     method.call(methodObject, value, "", value);
            // }
        },
		type$forEach: "util/forEach",
		var$model: undefined,
		view(data) {
			this.model = data;
		},
		modelFor(contentView) {
			return this.model;
		},
		part(key) {
			for (let part of this.to) {
				if (part.key == key) return part;
			}
		},
		get$parts() {
			return this.peer.$parts;
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
		createContent(value, key) {
			let type = this.typeFor(value, key);
			let conf = this.configurationFor(value, key);
			let control = this.owner.create(type, conf);
			this.control(control, key);
			this.append(control);
			return control;
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
		control(part, key) {
			part.key = key;
			this.parts[key] = part;
		},
		modelFor(contentView) {
			return this.members ? this.model : this.model && this.model[contentView.key];
		}
	}
}