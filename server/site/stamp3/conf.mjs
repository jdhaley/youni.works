import view from "./package/view.mjs";

export default {
	package$: "configuration",
	use: {
		view: view,
	},
	app: {
		type$: "use.view.App",
		viewers: {
		},
		conf: {
			typeSource: "/file/stamp/types3.json",
			dataSource: "/file/stamp/data3.json",
			dataType: "Issues"
		}
	}
}