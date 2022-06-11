export default {
	DataSource: {
		type$: "/base/data/DataSource",
		type$textUtil: "/base/util/Text",
		type$viewType: "/view/View",
		once$views() {
			let views = Object.create(null);
			for (let typeName in this.types) {
				let type = this.types[typeName];
				let members = Object.create(null);
				for (let name in type.members) {
					let conf = type.members[name];
					if (!conf.caption) {
						conf.caption = this.textUtil.captionize(name);
					}
					let view = this.owner.create(conf.viewType || this.viewType);
					this.owner.extend(view, {
						extend$conf: conf,
						dataSource: this,
					});
					members[name] = view;
				}
				views[typeName] = members;
			}
			return views;
		},
		once$owner() {
			return this[Symbol.for("owner")];
		}
	}
}