import util from "./package/util.mjs";
import control from "./package/control.mjs";
import view from "./package/view.mjs";
import grid from "./package/grid.mjs";
import prop from "./package/property.mjs";
import diagram from "./package/diagram.mjs";

import command from "./package/command.mjs";
import diagramCommand from "./package/diagramCommand.mjs";

import properties from "./conf/properties.mjs";
import events from "./conf/events.mjs";

export default {
	package$: "configuration",
	use: {
		util: util,
		command: command,
		diagramCommand: diagramCommand,
		control: control,
		view: view,
		grid: grid,
		prop: prop,
		diagram: diagram
	},
	app: {
		type$: "use.view.Application",
		use: {
			type$Frame: "use.view.Frame",
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