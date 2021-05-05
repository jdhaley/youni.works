import system from "../system/index.mjs";

import component from "./package/component.mjs";
import util from "./package/util.mjs";
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
		component: component,
		util: util,
		command: command,
		control: control
	}
}