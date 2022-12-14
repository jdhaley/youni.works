import { bundle } from "../../base/util.js";

import { Box } from "../../control/box.js";
import { EditBox } from "../../control/editBox.js";
import { Caption, DisplayType } from "../display.js";

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

const conf: bundle<any> = {
	display: {
		class: DisplayType,
		prototype: new Box(),
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
		prototype: new Box(),
		type: "display",
		header: "caption",
		body: "display"
	},
	text: {
		class: DisplayType,
		prototype: new EditBox(textDrawer, textEd),
		model: "unit",
		header: "caption",
		body: "display",
		actions: actions.text,
		tagName: "ui-text",
		shortcuts: shortcuts
	},
	record: {
		class: DisplayType,
		prototype: new EditBox(recordDrawer, recordEd),
		model: "record",
		header: "caption",
		body: "display",
		actions: actions.record, 
		tagName: "ui-record",
		shortcuts: shortcuts
	},
	list: {
		class: DisplayType,
		prototype: new EditBox(listDrawer, listEd),
		model: "list",
		header: "caption",
		body: "display",
		actions: actions.list,
		tagName: "ui-list",
		shortcuts: shortcuts
	},
	markup: {
		class: DisplayType,
		prototype: new EditBox(listDrawer, markupEd),
		model: "list",
		header: "caption",
		body: "display",
		actions: actions.markup,
		tagName: "ui-list",
		shortcuts: shortcuts
	},
	line: {
		class: DisplayType,
		prototype: new EditBox(lineDrawer, lineEd),
		model: "unit",
		body: null,
		actions: actions.line,
		tagName: "p",
		shortcuts: shortcuts
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
export default conf;