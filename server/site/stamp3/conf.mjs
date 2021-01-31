import base from "./package/base.mjs";
import view from "./package/view.mjs";
import part from "./package/part.mjs";

export default {
	package$: "configuration",
	use: {
		base: base,
		view: view,
		part: part
	},
	app: {
		type$: "use.view.App",
		conf: {
			typeSource: "/file/stamp/types3.json",
			dataSource: "/file/stamp/data3.json",
			objectType: "Issues",
			part: {
				char: {
					type$: "use.part.Input"
					//other conf stuff here.
				},
				number: {
					type$: "use.part.Input"
				},
				date: {
					type$: "use.part.Input"
				},
				boolean: {
					type$: "use.part.Input"
				},
				string: {
					type$: "use.part.Text"
				},
				text: {
					type$: "use.part.Text"
				},
				action: {
					type$: "use.part.Text"
				},
				media: {
					type$: "use.part.Media"
				},
				object: {
					type$: "use.part.Link"
				},
				array: {
					type$: "use.part.Link"					
				},
				link: {
					type$: "use.part.Link"
				},
				list: {
					type$: "use.part.Link",
					listType: "list | table | set"
				}
			}
		}
	}
}