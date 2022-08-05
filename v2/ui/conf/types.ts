import {BaseConf} from "../../base/loader.js";
import {bundle} from "../../base/util.js";

import text from "../controllers/text.js";
import record from "../controllers/record.js";
import list from "../controllers/list.js";

import shortcuts from "./shortcuts.js";
import { Editor } from "../article.js";

const conf: bundle<BaseConf> = {
	text: {
		class: Editor,
		view: "text",
		model: "text",
		panel: true,
		tagName: "ui-text",
		actions: text,
		shortcuts: shortcuts
	},
	markup: {
		class: Editor,
		view: "text",
		model: "text",
		panel: true,
		tagName: "ui-text",
		actions: text,
		shortcuts: shortcuts
	},
	list: {
		class: Editor,
		view: "list",
		model: "list",
		panel: true,
		tagName: "ui-list",
		actions: list,
		shortcuts: shortcuts
	},
	record: {
		class: Editor,
		view: "record",
		model: "record",
		panel: true,
		tagName: "ui-record",
		actions: record,
		shortcuts: shortcuts
	},
	tree: {
		class: Editor,
		view: "list",
		model: "list",
		panel: true,
		tagName: "ui-tree",
		actions: list,
		shortcuts: shortcuts
	}
}
export default conf;