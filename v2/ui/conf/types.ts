import {bundle} from "../../base/util.js";

import text from "../controllers/text.js";
import record from "../controllers/record.js";
import list from "../controllers/list.js";

import shortcuts from "./shortcuts.js";

import {DisplayConf, DisplayType} from "../display.js";

const conf: bundle<DisplayConf> = {
	text: {
		class: DisplayType,
		view: "text",
		model: "text",
		panel: true,
		tagName: "ui-text",
		actions: text,
		shortcuts: shortcuts
	},
	record: {
		class: DisplayType,
		view: "record",
		model: "record",
		panel: true,
		tagName: "ui-record",
		actions: record,
		shortcuts: shortcuts
	},
	list: {
		class: DisplayType,
		view: "list",
		model: "list",
		panel: true,
		tagName: "ui-list",
		actions: list,
		shortcuts: shortcuts
	}
}
export default conf;