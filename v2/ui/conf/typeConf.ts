import { bundle } from "../../base/util.js";

import { DisplayType } from "../display.js";
import { Viewbox } from "../legacy.js";

import edit from "./editorConf.js";
import actions from "./actions.js";
import shortcuts from "./shortcuts.js";

import { text } from "../../control/viewers/textViewer.js";
import { record } from "../../control/viewers/recordViewer.js";
import { list } from "../../control/viewers/listViewer.js";
import { line } from "../../control/viewers/lineViewer.js";

const conf: bundle<any> = {
	text: {
		class: DisplayType,
		model: "unit",
		viewType: "text",
		prototype: new Viewbox(text, edit.text),
		actions: actions.text,
		container: true,
		tagName: "ui-text",
		shortcuts: shortcuts
	},
	record: {
		class: DisplayType,
		model: "record",
		viewType: "form",
		prototype: new Viewbox(record, edit.record),
		actions: actions.record, 
		container: true,
		tagName: "ui-record",
		shortcuts: shortcuts
	},
	list: {
		class: DisplayType,
		model: "list",
		viewType: "list",
		prototype: new Viewbox(list, edit.list),
		actions: actions.list,
		container: true,
		tagName: "ui-list",
		shortcuts: shortcuts
	},
	markup: {
		class: DisplayType,
		model: "list",
		viewType: "markup",
		prototype: new Viewbox(list, edit.markup),
		actions: actions.markup,
		container: true,
		tagName: "ui-list",
		shortcuts: shortcuts
	},
	line: {
		class: DisplayType,
		model: "unit",
		viewType: "line",
		prototype: new Viewbox(line, edit.text),
		actions: actions.line,
		container: false,
		tagName: "p",
		shortcuts: shortcuts
	},
	// row: {
	// 	class: DisplayType,
	// 	model: "record",
	// 	viewType: "row",
	// 	prototype: new RowBox(actions.row, edit.record),
	// 	container: false,
	// 	tagName: "ui-row",
	// 	shortcuts: shortcuts
	// }
}
export default conf;