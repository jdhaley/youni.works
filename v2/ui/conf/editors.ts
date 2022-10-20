import { bundle } from "../../base/util.js";

import { ViewType } from "../../display/view.js";

import { TextBox } from "../../display/controls/text.js";
import { RecordBox } from "../../display/controls/record.js";
import { ListBox } from "../../display/controls/list.js";
import { LineBox } from "../../display/controls/line.js";
import { RowBox } from "../../display/controls/row.js";

import text from "../controllers/text.js";
import record from "../controllers/record.js";
import list from "../controllers/list.js";
import markup from "../controllers/markup.js";
import line from "../controllers/line.js";
import row from "../controllers/row.js";

import editor from "./editing.js";
import shortcuts from "./shortcuts.js";

export interface TypeConf {
	class: typeof ViewType;
	viewType: string,
	prototype?: any,
	container: boolean;
	tagName: string;
	shortcuts: bundle<string>;
}

const conf: bundle<TypeConf> = {
	text: {
		class: ViewType,
		viewType: "text",
		prototype: new TextBox(text, editor.text),
		container: true,
		tagName: "ui-text",
		shortcuts: shortcuts
	},
	record: {
		class: ViewType,
		viewType: "form",
		prototype: new RecordBox(record, editor.record),
		container: true,
		tagName: "ui-record",
		shortcuts: shortcuts
	},
	list: {
		class: ViewType,
		viewType: "list",
		prototype: new ListBox(list, editor.list),
		container: true,
		tagName: "ui-list",
		shortcuts: shortcuts
	},
	markup: {
		class: ViewType,
		viewType: "markup",
		prototype: new ListBox(markup, editor.markup),
		container: true,
		tagName: "ui-list",
		shortcuts: shortcuts
	},
	line: {
		class: ViewType,
		viewType: "line",
		prototype: new LineBox(line, editor.text),
		container: false,
		tagName: "p",
		shortcuts: shortcuts
	},
	row: {
		class: ViewType,
		viewType: "row",
		prototype: new RowBox(row, editor.record),
		container: false,
		tagName: "ui-row",
		shortcuts: shortcuts
	}
}
export default conf;