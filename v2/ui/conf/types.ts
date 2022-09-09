import {bundle} from "../../base/util.js";

import text from "../controllers/text.js";
import record from "../controllers/record.js";
import list from "../controllers/list.js";

import markup from "../controllers/markup.js";
import line from "../controllers/line.js";

import shortcuts from "./shortcuts.js";

import {DisplayConf, DisplayType} from "../display.js";

const conf: bundle<DisplayConf> = {
	text: {
		class: DisplayType,
		view: "text",
		model: "text",
		container: true,
		tagName: "ui-text",
		actions: text,
		shortcuts: shortcuts
	},
	record: {
		class: DisplayType,
		view: "record",
		model: "record",
		container: true,
		tagName: "ui-record",
		actions: record,
		shortcuts: shortcuts
	},
	list: {
		class: DisplayType,
		view: "list",
		model: "list",
		container: true,
		tagName: "ui-list",
		actions: list,
		shortcuts: shortcuts
	},
	markup: {
		class: DisplayType,
		container: true,
		view: "markup",
		model: "markup",
		tagName: "ui-list",
		actions: markup,
		shortcuts: shortcuts
	},
	line: {
		class: DisplayType,
		container: false,
		view: "line",
		model: "line",
		tagName: "p",
		actions: line,
		shortcuts: shortcuts
	}
}
export default conf;