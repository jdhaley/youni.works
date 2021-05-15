import system from "../system/index.mjs";

import control from "./package/control.mjs";
import command from "./package/command.mjs";
import util from "./package/util.mjs";

export default {
	sys: system.sys,
	module: {
		id: "base.youni.works",
		version: "1",
		moduleType: "library",
		uses: {
			system: system,
			example: "youni.works/system:2.1"
		}
	},
	packages: {
		control: control,
		command: command,
		util: util
	}
}