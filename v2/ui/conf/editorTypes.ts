import { bundle } from "../../base/util.js";
import { BoxConf } from "../../control/box.js";

import { textDrawer } from "../../control/drawers/textDrawer.js";
import { recordDrawer } from "../../control/drawers/recordDrawer.js";
import { listDrawer } from "../../control/drawers/listDrawer.js";
import { lineDrawer } from "../../control/drawers/lineDrawer.js";

import { textEd } from "../../edit/editors/textEditor.js";
import { recordEd } from "../../edit/editors/recordEditor.js";
import { listEd } from "../../edit/editors/listEditor.js";
import { markupEd } from "../../edit/editors/markupEditor.js";
import { lineEd } from "../../edit/editors/lineEditor.js";

import text from "../actions/edit/text.js";
import record from "../actions/record.js";
import list from "../actions/list.js";
import markup from "../actions/edit/markup.js";
import line from "../actions/edit/line.js";

const editors: bundle<BoxConf> = {
	editbox: {
		type: "editor",
		header: "caption",
		body: "display",		
	},
	unit: {
		type: "editbox",
		model: "unit",
		tagName: "ui-unit"
	},
	text: {
		type: "unit",
		drawer: textDrawer,
		editor: textEd,
		actions: text,
		tagName: "ui-text"
	},
	record: {
		type: "editbox",
		model: "record",
		drawer: recordDrawer,
		editor: recordEd,
		actions: record, 
		tagName: "ui-record"
	},
	list: {
		type: "editbox",
		model: "list",
		drawer: listDrawer,
		editor: listEd,
		actions: list,
		tagName: "ui-list",
	},
	markup: {
		type: "list",
		editor: markupEd,
		actions: markup,
	},
	line: {
		type: "text",
		body: "",
		drawer: lineDrawer,
		editor: lineEd,
		actions: line,
		tagName: "p"
	}
	// row: {
	// 	class: DisplayType,
	// 	model: "record",
	// 	prototype: new RowBox(actions.row, edit.record),
	// 	container: false,
	// 	tagName: "ui-row",
	// 	shortcuts: shortcuts
	// }
}

export default editors