export default {
	// String:
	// Number:
	// Date:
	// Boolean:

	 DevtMember: {
		type$: "/view/View",
		extend$conf: {
			caption: "",
			icon: "",
		},
		key: "",
		title: "",
		icon: "",
	},
	DataSource: {
		getMetadata(name) {
		},
		getData(filter) {
			return this.data[filter];
		}
	},
	DataSet: {
		objectType: null,

	},
	DataSource: {
		types: {
		},
		data: {
		}
	}
}