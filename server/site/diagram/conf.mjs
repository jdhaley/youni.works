import control		from "../base/package/control.mjs";
import view			from "../web/package/view.mjs";
import browser		from "../web/package/browser.mjs";

import services		from "./conf/services.mjs";
import parts		from "./conf/parts.mjs";

import actions		from "./conf/actions.mjs";
import platform		from "./conf/platform/browser.mjs";

const document = window.document;

export default {
	packages: {
		control: control,
		view: view,
		browser: browser,
		
		services: services,
		parts: parts		
	},
	document: document,
	actions: actions,
	platform: platform
}