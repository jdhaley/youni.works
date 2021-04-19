import system from "../sys/index.mjs";
import module from "./module.mjs";
import events from "./conf/events.mjs";
import editors from "./conf/editors.mjs";

export default {
	module: module,
	sys: system.sys,
	app: {
		events: events,
		editors: editors
	}
}