export default {
	char: {
		type$: "use.prop.Input"
		//other conf stuff here.
	},
	number: {
		type$: "use.prop.Input"
	},
	date: {
		type$: "use.prop.Input"
	},
	boolean: {
		type$: "use.prop.Input"
	},
	string: {
		type$: "use.prop.Text"
	},
	text: {
		type$: "use.prop.Text"
	},
	action: {
		type$: "use.prop.Text"
	},
	media: {
		type$: "use.prop.Media"
	},
	object: {
		type$: "use.prop.Link"
	},
	array: {
		type$: "use.prop.Link"					
	},
	link: {
		type$: "use.prop.Link"
	},
	list: {
		type$: "use.prop.Link",
		listType: "list | table | set"
	}
}
