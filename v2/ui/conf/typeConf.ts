import { bundle } from "../../base/util.js";

import { LegacyType } from "../display.js";

import { TextBox } from "../controls/text.js";
import { RecordBox } from "../controls/record.js";
import { ListBox } from "../controls/list.js";
import { LineBox } from "../controls/line.js";
import { RowBox } from "../controls/row.js";


import edit from "./editorConf.js";
import actions from "./actions.js";
import shortcuts from "./shortcuts.js";

const conf: bundle<any> = {
	text: {
		class: LegacyType,
		model: "unit",
		viewType: "text",
		prototype: new TextBox(actions.text, edit.text),
		container: true,
		tagName: "ui-text",
		shortcuts: shortcuts
	},
	record: {
		class: LegacyType,
		model: "record",
		viewType: "form",
		prototype: new RecordBox(actions.record, edit.record),
		container: true,
		tagName: "ui-record",
		shortcuts: shortcuts
	},
	list: {
		class: LegacyType,
		model: "list",
		viewType: "list",
		prototype: new ListBox(actions.list, edit.list),
		container: true,
		tagName: "ui-list",
		shortcuts: shortcuts
	},
	markup: {
		class: LegacyType,
		model: "list",
		viewType: "markup",
		prototype: new ListBox(actions.markup, edit.markup),
		container: true,
		tagName: "ui-list",
		shortcuts: shortcuts
	},
	line: {
		class: LegacyType,
		model: "unit",
		viewType: "line",
		prototype: new LineBox(actions.line, edit.text),
		container: false,
		tagName: "p",
		shortcuts: shortcuts
	},
	row: {
		class: LegacyType,
		model: "record",
		viewType: "row",
		prototype: new RowBox(actions.row, edit.record),
		container: false,
		tagName: "ui-row",
		shortcuts: shortcuts
	}
}
export default conf;