import {BaseConf} from "../../base/loader.js";
import {bundle} from "../../base/util.js";

import text from "../controllers/text.js";
import record from "../controllers/record.js";
import list from "../controllers/list.js";

import shortcuts from "./shortcuts.js";
import { Editor } from "../editor/edit.js";

const conf: bundle<BaseConf> = {
	text: {
		class: Editor,
		model: "text",
		panel: true,
		tagName: "ui-text",
		actions: text,
		shortcuts: shortcuts
	},
	markup: {
		class: Editor,
		model: "text",
		panel: true,
		tagName: "ui-text",
		actions: text,
		shortcuts: shortcuts
	},
	list: {
		class: Editor,
		model: "list",
		panel: true,
		tagName: "ui-list",
		actions: list,
		shortcuts: shortcuts
	},
	record: {
		class: Editor,
		model: "record",
		panel: true,
		tagName: "ui-record",
		actions: record,
		shortcuts: shortcuts
	},
	tree: {
		class: Editor,
		model: "list",
		panel: true,
		tagName: "ui-tree",
		actions: list,
		shortcuts: shortcuts
	}
}
export default conf;