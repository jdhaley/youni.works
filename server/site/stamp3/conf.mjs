import base from "./package/base.mjs";
import view from "./package/view.mjs";
import prop from "./package/property.mjs";

import properties from "./conf/properties.mjs";

export default {
	package$: "configuration",
	use: {
		base: base,
		view: view,
		prop: prop
	},
	app: {
		type$: "use.view.Application",
		conf: {
			dataSource: "/file/stamp/data3.json",
			typeSource: "/file/stamp/types3.json",
			objectType: "Issues",
			propertyType: properties
		}
	}
}