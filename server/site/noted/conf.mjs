import control		from "../base/package/control.mjs";
import view			from "../web/package/view.mjs";
import ui			from "../web/package/ui.mjs";
import client		from "../web/package/client.mjs";

import browser		from "../web/conf/browser.mjs";

import parts		from "./conf/parts.mjs";
import services		from "./conf/services.mjs";
import actions		from "./conf/actions.mjs";


export default {
	action: "initialize",
	channel: "self",
	
	packages: {
		control: control,
		client: client,
		view: view,
		ui: ui,

		services: services,
		parts: parts		
	},
	window: window,
	platform: browser,
	actions: actions
}