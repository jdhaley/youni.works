import base from "./package/base.mjs";
import app from "./package/app.mjs";
import view from "./package/view.mjs";
import prop from "./package/property.mjs";
import shape from "./package/shape.mjs";

import properties from "./conf/properties.mjs";
import events from "./conf/events.mjs";

export default {
	package$: "configuration",
	use: {
		base: base,
		app: app,
		view: view,
		prop: prop,
		shape: shape
	},
	app: {
		type$: "use.app.Application",
		use: {
			type$Frame: "use.app.Frame",
			type$Component: "use.view.Component"
		},
		propertyType: properties
	},
	conf: {
		window: window,
		events: events
	}
}