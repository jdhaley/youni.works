import system from "../system/index.mjs";

import util from "./package/util.mjs";
import component from "./package/component.mjs";
import command from "./package/command.mjs";
import control from "./package/control.mjs";

export default {
	sys: system.sys,
	module: {
		id: "base.youni.works",
		version: "1",
		moduleType: "library",
		uses: [system]
	},
	packages: {
		util: util,
		component: component,
		command: command,
		control: control
	}
}