import base from "./package/base.mjs";
import view from "./package/view.mjs";

export default {
	package$: "configuration",
	use: {
		base: base,
		view: view
	},
	app: {
		type$: "use.view.App",
		conf: {
			typeSource: "/file/stamp/types3.json",
			dataSource: "/file/stamp/data3.json",
			dataType: "Issues"
		}
	}
}