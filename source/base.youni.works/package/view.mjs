export default {
	type$: "/control",
	Startable: {
		extend$conf: {
		},
		start(conf) {
			if (conf) this.let("conf", conf, "extend");
		},
	},
	Viewer: {
		type$: "Startable",
		view(model) {
		},
		modelFor(key) {
		},
		extend$actions: {
			view(event) {
				let model = event.from.modelFor(this.key);
				this.view(model);
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
					let member = this.members[name];
					member && this.createPart(name, member);
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
			if (this.contentType) {
				if (this.model) return this.model[key];
			}
			return this.model;
		}
	}
}