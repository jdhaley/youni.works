import control		from "../base/package/control.mjs";
import view			from "../web/package/view.mjs";
import client		from "../web/package/client.mjs";
import ui			from "../web/package/ui.mjs";

import services		from "./conf/services.mjs";
import parts		from "./conf/parts.mjs";

import actions		from "./conf/actions.mjs";
import platform		from "../web/conf/browser.mjs";

const document = window.document;

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
	document: document,
	actions: actions,
	platform: platform
}