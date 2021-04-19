import system from "../system/index.mjs";
import module from "./module.mjs";
import events from "./conf/events.mjs";
import editors from "./conf/editors.mjs";

export default {
	system: system,
	module: module,
	app: {
		events: events,
		editors: editors
	}
}