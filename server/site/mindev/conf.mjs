import util from "./package/util.mjs";
import command from "./package/command.mjs";
import control from "./package/control.mjs";
import view from "./package/view.mjs";

import diagram from "./package/diagram.mjs";
import object from "./package/object.mjs";

import events from "./conf/events.mjs";
import editors from "./conf/editors.mjs";

export default {
	use: {
		util: util,
		command: command,
		control: control,
		view: view,
		diagram: diagram,
		object: object
	},
	app: {
		events: events,
		editors: editors
	}
}

//import prop from "./package/property.mjs";
//import properties from "./conf/properties.mjs";