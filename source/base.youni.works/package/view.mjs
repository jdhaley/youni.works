export default {
	Viewer: {
		view(model) {
		}
	},
	Container: {
		type$: "Viewer",
		require$owner: null,
		require$put(control) {
		},
		type$contentType: "Viewer",
		var$model: undefined,
		view(model) {
			this.model = model;
			this.observe && this.observe(model);
		},
		modelFor(viewer) {
			return this.model;
		},
		// at(key) {
		// 	for (let part of this.to) {
		// 		if (part.key == key) return part;
		// 	}
		// },
		// put(content) {
		// }
		extend$actions: {
			view() {
				for (let part of this.to) {
					part.view(this.modelFor(part));
				}
			}
		}
	},
	Structure: {
		type$: "Container",
		extend$conf: {
			memberType: "/ui/view/Viewer"
		},
		once$members() {
			let members = Object.create(null);
			for (let name in this.conf.members) {
				let conf = this.conf.members[name];
				let type = conf.type || this.conf.memberType;

				//TODO For now, keep the member types consistent & simple:
				let member = this.conf.memberType.extend(conf);
				member.let("key", name, "const");
				members[name] = member;
			}
			return members;
		},
		start(conf) {
			this.super(start, conf);
			for (let name in this.members) {
				let control = this.owner.create(this.members[name]);
				control.key = name;
				this.put(control);
			}
		}
	},
	Collection: {
		type$: "Viewer",
		type$contentType: "Viewer",
		view(model) {
			this.super(view, model);
			if (!model) {
				return;
			} else if (model[Symbol.iterator]) {
                let key = 0;
                for (let content of model) {
					this.createContent(key++, content);
                }
            } else if (typeof model == "object") {
                for (let key in model) {
                    this.createContent(key, model[key]);
                }
            }			
		},
		createContent(key, value) {
			let type = value && value.type || this.contentType;
			let content = this.owner.create(type);
			content.key = key;
			this.put(content);
		}
	}
}