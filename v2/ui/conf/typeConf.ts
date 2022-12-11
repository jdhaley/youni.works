import { bundle } from "../../base/util.js";

import { LegacyType, Viewbox } from "../legacy.js";


import edit from "./editorConf.js";
import actions from "./actions.js";
import shortcuts from "./shortcuts.js";

import { text } from "../../control/viewers/textViewer.js";
import { record } from "../../control/viewers/recordViewer.js";
import { list } from "../../control/viewers/listViewer.js";
import { line } from "../../control/viewers/lineViewer.js";

const conf: bundle<any> = {
	text: {
		class: LegacyType,
		model: "unit",
		viewType: "text",
		prototype: new Viewbox(text, actions.text, edit.text),
		container: true,
		tagName: "ui-text",
		shortcuts: shortcuts
	},
	record: {
		class: LegacyType,
		model: "record",
		viewType: "form",
		prototype: new Viewbox(record, actions.record, edit.record),
		container: true,
		tagName: "ui-record",
		shortcuts: shortcuts
	},
	list: {
		class: LegacyType,
		model: "list",
		viewType: "list",
		prototype: new Viewbox(list, actions.list, edit.list),
		container: true,
		tagName: "ui-list",
		shortcuts: shortcuts
	},
	markup: {
		class: LegacyType,
		model: "list",
		viewType: "markup",
		prototype: new Viewbox(list, actions.markup, edit.markup),
		container: true,
		tagName: "ui-list",
		shortcuts: shortcuts
	},
	line: {
		class: LegacyType,
		model: "unit",
		viewType: "line",
		prototype: new Viewbox(line, actions.line, edit.text),
		container: false,
		tagName: "p",
		shortcuts: shortcuts
	},
	// row: {
	// 	class: LegacyType,
	// 	model: "record",
	// 	viewType: "row",
	// 	prototype: new RowBox(actions.row, edit.record),
	// 	container: false,
	// 	tagName: "ui-row",
	// 	shortcuts: shortcuts
	// }
}
export default conf;