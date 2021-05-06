import ui from "../ui/index.mjs";

import app from "./package/app.mjs";
import example from "./package/example.mjs";
import events from "./conf/events.mjs";
import editors from "./conf/editors.mjs";

export default {
	sys: ui.sys,
	module: {
		id: "app.youni.works",
		version: "1",
		moduleType: "ui",
		uses: [ui],
	},
	packages: {
		app: app,
		example: example
	},
	app: {
		ownerType: "/ui.youni.works/view/Frame",
		window: window,
		events: events,
		editors: editors
	}
}