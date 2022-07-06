import {BaseConf} from "../../base/loader.js";
import {ViewType} from "../../base/view.js";
import {bundle} from "../../base/util.js";

import {ListEditor} from "../editor/list.js";
import {RecordEditor} from "../editor/record.js";
import {TextEditor} from "../editor/text.js";
import controllers  from "./controllers.js";
import shortcuts from "./shortcuts.js";

const conf: bundle<BaseConf> = {
	text: {
		class: TextEditor as typeof ViewType,
		tagName: "ui-text",
		controller: controllers.text,
		shortcuts: shortcuts
	},
	markup: {
		class: TextEditor as typeof ViewType,
		tagName: "ui-text",
		controller: controllers.text,
		shortcuts: shortcuts
	},
	list: {
		class: ListEditor as typeof ViewType,
		tagName: "ui-list",
		controller: controllers.list,
		shortcuts: shortcuts
	},
	record: {
		class: RecordEditor as typeof ViewType,
		tagName: "ui-record",
		controller: controllers.record,
		shortcuts: shortcuts
	},
	tree: {
		class: ListEditor as typeof ViewType,
		tagName: "ui-tree",
		controller: controllers.list,
		shortcuts: shortcuts
	}
}
export default conf;