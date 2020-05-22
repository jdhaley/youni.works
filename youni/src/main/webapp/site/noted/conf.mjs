import signal		from "../base/package/signal.mjs";
import part			from "../base/package/part.mjs";
import platform		from "../web/package/platform.mjs";
import ui			from "../web/package/ui.mjs";

import parts		from "./conf/parts.mjs";
import services		from "./conf/services.mjs";

import browser		from "../web/conf/browser.mjs";
import actions		from "./conf/actions.mjs";

export default {
	packages: {
		signal: signal,
		part: part,
		platform: platform,
		ui: ui,

		services: services,
		parts: parts		
	},
	platform: browser,
	actions: actions
}