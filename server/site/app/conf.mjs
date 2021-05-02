import ui from "../ui/index.mjs";

import events from "./conf/events.mjs";
import editors from "./conf/editors.mjs";

export default {
	sys: ui.sys,
	module: {
		id: "app.youni.works",
		version: "1",
		moduleType: "ui",
		uses: [ui]
	},
	app: {
		events: events,
		editors: editors
	}
}