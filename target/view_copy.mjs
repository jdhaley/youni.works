export default {
 	View: {
		extend$conf: {
			contentType: "/base/view/View",
		},
		var$model: undefined,
		view(model) {
			this.model = model;
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
			return this.conf.contentType;
		},
		configurationFor(value, key) {
			return this.conf;
		},
		control(control, key) {
			control.key = key;
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
		},
		type$forEach: "forEach",
	},
	Collection: {
		type$: "View",
		view(model) {
			this.model = model;
			this.forEach(model, this.createContent);
		},
		modelFor(contentView) {
			return this.model && this.model[contentView.key];
		},
	},
    Structure: {
		type$: "View",
		members: {
		},
		parts: null,
		view(model) {
			if (!this.parts) {
				this.let("parts", Object.create(null));
				this.forEach(this.members, this.createContent);
			}
			this.model = model;
		},
		control(part, key) {
			this.super(control, part, key);
			this.parts[key] = part;
		},
		typeFor(value, key) {
			if (value && typeof value == "object") {
				return value.receive ? value : value.contentType || this.conf.contentType;
			}
			return this[Symbol.for("owner")].forName("" + value) || this.conf.contentType;
		},
		configurationFor(value, key) {
			return value && typeof value == "object" && !value.receive ? value : this.conf;
		},
		modelFor(contentView) {
			return this.model && this.model[contentView.key];
		},
	},
			/**
		 * Iterates over an Iterable or Object invoking the method argument
		 * for each iteration.
		 * @param value 
		 * @param method 
		 */
			 forEach(value, method, methodObject) {
				if (!methodObject) methodObject = this;
				if (value && value[Symbol.iterator]) {
					let i = 0;
					for (let datum of value) {
						method.call(this, datum, i++, value);
					}
				} else if (typeof value == "object") {
					for (let name in value) {
						method.call(methodObject, value[name], name, value);
					}
				} else {
					method.call(this, value);
				}
			},	
}