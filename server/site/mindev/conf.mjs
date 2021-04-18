import events from "./conf/events.mjs";
import editors from "./conf/editors.mjs";
import module from "./module.mjs";
import sys from "../sys/index.mjs";

export default {
	module: module,
	sys: sys,
	app: {
		events: events,
		editors: editors
	}
}