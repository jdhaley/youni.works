export default {
	type$: "/control",
	View: {
		type$: "Viewer",
		//there is an issue with the require$markup seeming to replace Element.markup
		//	require$markup: "",
		require$createPart(key, type) {
			let part = this.super(createPart, key, type);
			part.view(this.modelFor(key));
		},
		var$model: undefined,
		view(model) {
			this.model = model;
			this.observe && this.observe(model);
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
		},
		modelFor(key) {
			if (this.contentType) {
				if (this.model) return this.model[key];
			}
			return this.model;
		}
	}
}