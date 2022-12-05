import { bundle } from "../../base/util.js";

import { BType } from "../../control/box.js";

import { TextBox } from "../controls/text.js";
import { RecordBox } from "../controls/record.js";
import { ListBox } from "../controls/list.js";
import { LineBox } from "../controls/line.js";
import { RowBox } from "../controls/row.js";


import edit from "./edit.js";
import actions from "./actions.js";
import shortcuts from "./shortcuts.js";

const conf: bundle<any> = {
	text: {
		class: BType,
		model: "unit",
		viewType: "text",
		prototype: new TextBox(actions.text, edit.text),
		container: true,
		tagName: "ui-text",
		shortcuts: shortcuts
	},
	record: {
		class: BType,
		model: "record",
		viewType: "form",
		prototype: new RecordBox(actions.record, edit.record),
		container: true,
		tagName: "ui-record",
		shortcuts: shortcuts
	},
	list: {
		class: BType,
		model: "list",
		viewType: "list",
		prototype: new ListBox(actions.list, edit.list),
		container: true,
		tagName: "ui-list",
		shortcuts: shortcuts
	},
	markup: {
		class: BType,
		model: "list",
		viewType: "markup",
		prototype: new ListBox(actions.markup, edit.markup),
		container: true,
		tagName: "ui-list",
		shortcuts: shortcuts
	},
	line: {
		class: BType,
		model: "unit",
		viewType: "line",
		prototype: new LineBox(actions.line, edit.text),
		container: false,
		tagName: "p",
		shortcuts: shortcuts
	},
	row: {
		class: BType,
		model: "record",
		viewType: "row",
		prototype: new RowBox(actions.row, edit.record),
		container: false,
		tagName: "ui-row",
		shortcuts: shortcuts
	}
}
export default conf;