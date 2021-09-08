export default {
	Dataset: {
		dataSource: null,
		dataType: null,
		create(value) {
		},
		retrieve(id) {
		},
		update(id, value) {
		},
		del(id) {
		}
	},
	DataSource: {
		types: {
		},
		data: {
		},
		once$views() {
			let views = Object.create(null);
			for (let typeName in this.types) {
				let type = this.types[typeName];
				let members = Object.create(null);
				for (let memberName in type.members) {
					let member = type.members[memberName];
					member.name = memberName;
					let memberType = member.viewType || "/ui/record/Property";
					members[memberName] = this.owner.create(memberType, member);
				}
				views[typeName] = members;
			}
		},
		start() {
		},
	}
}