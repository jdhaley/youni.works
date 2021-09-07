export default {
	type$: "/control",
	Viewer: {
		require$to: "Iterable",
		view(model) {
		},
		modelFor(key) {
		},
		extend$actions: {
			view(event) {
				for (let part of this.to) {
					try {
						part.view(this.modelFor(part.key));
					} catch (err) {
						console.error(err);
					}
				}
			}
		}
	},
	View: {
		type$: "Viewer",
		require$markup: "",
		require$createPart(key, type) {
		},
		var$model: undefined,
		view(model) {
			if (this.members && !this.markup) {
				for (let name in this.members) {
					this.createPart(name, this.members[name]);
				}
			} else if (this.contentType) {
				this.markup = "";
				if (!model) {
					return;
				} else if (model[Symbol.iterator]) {
					let key = 0;
					for (let content of model) {
						let type = content && content.type || this.contentType;
						this.createPart(key++, type);
					}
				} else if (typeof model == "object") {
					for (let key in model) {
						let type = model[key] && model[key].type || this.contentType
						this.createPart(key, type);
					}
				}
			}
			this.model = model;
			this.observe && this.observe(model);
		},
		modelFor(key) {
			return this.contentType && this.model ? this.model[key] : this.model;
		}
	}
}