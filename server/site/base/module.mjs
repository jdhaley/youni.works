import util from "./package/util.mjs";
import command from "./package/command.mjs";
import control from "./package/control.mjs";

export default {
	id: "base.youni.works",
	version: "1",
	moduleType: "library",
	packages: {
		util: util,
		command: command,
		control: control
	}
}