import { bundle } from "../../base/util.js";

import { Display, Caption, DisplayType } from "../display.js";

import actions from "./actions.js";
import shortcuts from "./shortcuts.js";

import { textDrawer } from "../../control/drawers/textDrawer.js";
import { recordDrawer } from "../../control/drawers/recordDrawer.js";
import { listDrawer } from "../../control/drawers/listDrawer.js";
import { lineDrawer } from "../../control/drawers/lineDrawer.js";

import { textEd } from "../../edit/editors/textEditor.js";
import { recordEd } from "../../edit/editors/recordEditor.js";
import { listEd } from "../../edit/editors/listEditor.js";
import { markupEd } from "../../edit/editors/markupEditor.js";
import { lineEd } from "../../edit/editors/lineEditor.js";
import { EditBox } from "../../control/editorControl.js";

const conf: bundle<any> = {
	display: {
		class: DisplayType,
		prototype: new Display(),
		actions: actions.view,
		shortcuts: shortcuts
	},
	caption: {
		class: DisplayType,
		type: "display",
		prototype: new Caption(),
		tagName: "header",
	},
	panel: {
		class: DisplayType,
		prototype: new Display(),
		type: "display",
		header: "caption",
		body: "display"
	},

	text: {
		class: DisplayType,
		header: "caption",
		body: "display",
		model: "unit",
		viewType: "text",
		prototype: new EditBox(textDrawer, textEd),
		actions: actions.text,
		tagName: "ui-text",
		shortcuts: shortcuts
	},
	record: {
		class: DisplayType,
		header: "caption",
		body: "display",
		model: "record",
		viewType: "form",
		prototype: new EditBox(recordDrawer, recordEd),
		actions: actions.record, 
		tagName: "ui-record",
		shortcuts: shortcuts
	},
	list: {
		class: DisplayType,
		header: "caption",
		body: "display",
		model: "list",
		viewType: "list",
		prototype: new EditBox(listDrawer, listEd),
		actions: actions.list,
		tagName: "ui-list",
		shortcuts: shortcuts
	},
	markup: {
		class: DisplayType,
		header: "caption",
		body: "display",
		model: "list",
		viewType: "markup",
		prototype: new EditBox(listDrawer, markupEd),
		actions: actions.markup,
		tagName: "ui-list",
		shortcuts: shortcuts
	},
	line: {
		class: DisplayType,
		body: null,
		model: "unit",
		viewType: "line",
		prototype: new EditBox(lineDrawer, lineEd),
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