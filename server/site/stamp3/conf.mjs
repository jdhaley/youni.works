import base from "./package/base.mjs";
import app from "./package/app.mjs";
import grid from "./package/grid.mjs";
import prop from "./package/property.mjs";
import diagram from "./package/diagram.mjs";

import properties from "./conf/properties.mjs";
import events from "./conf/events.mjs";

export default {
	package$: "configuration",
	use: {
		base: base,
		app: app,
		grid: grid,
		prop: prop,
		diagram: diagram
	},
	app: {
		type$: "use.app.Application",
		use: {
			type$Frame: "use.app.Frame",
			type$Diagram: "use.diagram.Diagram",
			type$Component: "use.grid.Component"
		},
		propertyType: properties
	},
	conf: {
		window: window,
		events: events
	}
}