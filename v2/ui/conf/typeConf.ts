import { bundle } from "../../base/util.js";

import { Caption, DisplayType, BoxType, Box } from "../display.js";

import edit from "./editorConf.js";
import actions from "./actions.js";
import shortcuts from "./shortcuts.js";

import { text } from "../../control/viewers/textViewer.js";
import { record } from "../../control/viewers/recordViewer.js";
import { list } from "../../control/viewers/listViewer.js";
import { line } from "../../control/viewers/lineViewer.js";
import { View, VType } from "../../control/view.js";

const conf: bundle<any> = {
	body: {
		class: VType,
		prototype: new View()
	},
	caption: {
		class: DisplayType,
		prototype: new Caption(),
		tagName: "header",
	},
	text: {
		class: BoxType,
		header: "caption",
		body: "body",
		model: "unit",
		viewType: "text",
		prototype: new Box(text, edit.text),
		actions: actions.text,
		tagName: "ui-text",
		shortcuts: shortcuts
	},
	record: {
		class: BoxType,
		header: "caption",
		body: "body",
		model: "record",
		viewType: "form",
		prototype: new Box(record, edit.record),
		actions: actions.record, 
		tagName: "ui-record",
		shortcuts: shortcuts
	},
	list: {
		class: BoxType,
		header: "caption",
		body: "body",
		model: "list",
		viewType: "list",
		prototype: new Box(list, edit.list),
		actions: actions.list,
		tagName: "ui-list",
		shortcuts: shortcuts
	},
	markup: {
		class: BoxType,
		header: "caption",
		body: "body",
		model: "list",
		viewType: "markup",
		prototype: new Box(list, edit.markup),
		actions: actions.markup,
		tagName: "ui-list",
		shortcuts: shortcuts
	},
	line: {
		class: BoxType,
		body: null,
		model: "unit",
		viewType: "line",
		prototype: new Box(line, edit.text),
		actions: actions.line,
		tagName: "p",
		shortcuts: shortcuts
	}
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