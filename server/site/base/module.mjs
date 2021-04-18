import system from "../sys/index.mjs";
import util from "./package/util.mjs";
import command from "./package/command.mjs";
import control from "./package/control.mjs";

export default {
	id: "base.youni.works",
	version: "1",
	moduleType: "library",
	uses: [system],
	packages: {
		util: util,
		command: command,
		control: control
	}
}