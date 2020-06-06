import control		from "../base/package/control.mjs";
import ui			from "../web/package/control.mjs";

import services		from "./conf/services.mjs";
import parts		from "./conf/parts.mjs";

import actions		from "./conf/actions.mjs";
import platform		from "../web/conf/browser.mjs";

export default {
	packages: {
		control: control,
		ui: ui,

		services: services,
		parts: parts		
	},
	actions: actions,
	platform: platform
}