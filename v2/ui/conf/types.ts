import {BaseConf} from "../../base/loader.js";
import {ViewType} from "../../base/view.js";
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
		class: TextEditor as typeof ViewType,
		tagName: "ui-text",
		controller: text,
		shortcuts: shortcuts
	},
	markup: {
		class: TextEditor as typeof ViewType,
		tagName: "ui-text",
		controller: text,
		shortcuts: shortcuts
	},
	list: {
		class: ListEditor as typeof ViewType,
		tagName: "ui-list",
		controller: list,
		shortcuts: shortcuts
	},
	record: {
		class: RecordEditor as typeof ViewType,
		tagName: "ui-record",
		controller: record,
		shortcuts: shortcuts
	},
	tree: {
		class: ListEditor as typeof ViewType,
		tagName: "ui-tree",
		controller: list,
		shortcuts: shortcuts
	}
}
export default conf;