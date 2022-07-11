import {BaseConf} from "../../base/loader.js";
import {bundle} from "../../base/util.js";

import {ListEditor} from "../editor/list.js";
import {RecordEditor} from "../editor/record.js";
import {TextEditor} from "../editor/text.js";

import text from "../controllers/text.js";
import record from "../controllers/record.js";
import list from "../controllers/list.js";

import shortcuts from "./shortcuts.js";

const conf: bundle<BaseConf> = {
	text: {
		class: TextEditor,
		tagName: "ui-text",
		controller: text,
		shortcuts: shortcuts
	},
	markup: {
		class: TextEditor,
		tagName: "ui-text",
		controller: text,
		shortcuts: shortcuts
	},
	list: {
		class: ListEditor,
		tagName: "ui-list",
		controller: list,
		shortcuts: shortcuts
	},
	record: {
		class: RecordEditor,
		tagName: "ui-record",
		controller: record,
		shortcuts: shortcuts
	},
	tree: {
		class: ListEditor,
		tagName: "ui-tree",
		controller: list,
		shortcuts: shortcuts
	}
}
export default conf;