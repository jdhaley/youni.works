import { bundle } from "../../base/util.js";
import { Display } from "../display.js";

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

const editors: bundle<Display> = {
	editbox: {
		type: "editor",
		header: "label",
		body: "display",		
		kinds: {
			editor: ""
		}
	},
	unit: {
		type: "editbox",
		model: "unit",
		tagName: "ui-unit",
		kinds: {
			unit: ""
		}
	},
	text: {
		type: "editbox",
		model: "unit",
		drawer: textDrawer,
		editor: textEd,
		actions: text,
		tagName: "ui-text",
		kinds: {
			text: ""
		}
	},
	record: {
		type: "editbox",
		model: "record",
		drawer: recordDrawer,
		editor: recordEd,
		actions: record, 
		tagName: "ui-record",
		kinds: {
			record: ""
		}
	},
	list: {
		type: "editbox",
		model: "list",
		drawer: listDrawer,
		editor: listEd,
		actions: list,
		tagName: "ui-list",
		kinds: {
			list: ""
		}
	},
	markup: {
		type: "list",
		editor: markupEd,
		actions: markup,
		kinds: {
			markup: ""
		}
	},
	line: {
		type: "text",
		body: "",
		drawer: lineDrawer,
		editor: lineEd,
		actions: line,
		tagName: "p",
		kinds: {
			line: ""
		}
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