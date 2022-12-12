import { bundle } from "../../base/util.js";

import { Display, DisplayType } from "../display.js";
import { BoxType2, Viewbox } from "../legacy.js";

import edit from "./editorConf.js";
import actions from "./actions.js";
import shortcuts from "./shortcuts.js";

import { text } from "../../control/viewers/textViewer.js";
import { record } from "../../control/viewers/recordViewer.js";
import { list } from "../../control/viewers/listViewer.js";
import { line } from "../../control/viewers/lineViewer.js";

const conf: bundle<any> = {
	caption: {
		class: DisplayType,
		prototype: new Display(),
		tagName: "header",
		actions: {
			view() {
				this.view.textContent = this.partOf.type.title;
			}
		}
	},
	text: {
		class: BoxType2,
		header: "caption",
		model: "unit",
		viewType: "text",
		prototype: new Viewbox(text, edit.text),
		actions: actions.text,
		container: true,
		tagName: "ui-text",
		shortcuts: shortcuts
	},
	record: {
		class: BoxType2,
		header: "caption",
		model: "record",
		viewType: "form",
		prototype: new Viewbox(record, edit.record),
		actions: actions.record, 
		container: true,
		tagName: "ui-record",
		shortcuts: shortcuts
	},
	list: {
		class: BoxType2,
		header: "caption",
		model: "list",
		viewType: "list",
		prototype: new Viewbox(list, edit.list),
		actions: actions.list,
		container: true,
		tagName: "ui-list",
		shortcuts: shortcuts
	},
	markup: {
		class: BoxType2,
		header: "caption",
		model: "list",
		viewType: "markup",
		prototype: new Viewbox(list, edit.markup),
		actions: actions.markup,
		container: true,
		tagName: "ui-list",
		shortcuts: shortcuts
	},
	line: {
		class: BoxType2,
		header: "caption",
		model: "unit",
		viewType: "line",
		prototype: new Viewbox(line, edit.text),
		actions: actions.line,
		container: false,
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