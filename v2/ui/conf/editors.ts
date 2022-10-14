import { bundle } from "../../base/util.js";

import { ViewBoxType } from "../../box/view.js";

import { TextBox } from "../../box/controls/text.js";
import { RecordBox } from "../../box/controls/record.js";
import { ListBox } from "../../box/controls/list.js";
import { LineBox } from "../../box/controls/line.js";
import { RowBox } from "../../box/controls/row.js";

import text from "../controllers/text.js";
import record from "../controllers/record.js";
import list from "../controllers/list.js";
import markup from "../controllers/markup.js";
import line from "../controllers/line.js";
import row from "../controllers/row.js";

import textEd from "../../editor/editors/text.js";
import recordEd from "../../editor/editors/record.js";
import listEd from "../../editor/editors/list.js";
import markupEd from "../../editor/editors/markup.js";

import shortcuts from "./shortcuts.js";

export interface TypeConf {
	class: typeof ViewBoxType;
	viewType: string,
	prototype?: any,
	container: boolean;
	tagName: string;
	shortcuts: bundle<string>;
}

const conf: bundle<TypeConf> = {
	text: {
		class: ViewBoxType,
		viewType: "text",
		prototype: new TextBox(text, textEd),
		container: true,
		tagName: "ui-text",
		shortcuts: shortcuts
	},
	record: {
		class: ViewBoxType,
		viewType: "form",
		prototype: new RecordBox(record, recordEd),
		container: true,
		tagName: "ui-record",
		shortcuts: shortcuts
	},
	list: {
		class: ViewBoxType,
		viewType: "list",
		prototype: new ListBox(list, listEd),
		container: true,
		tagName: "ui-list",
		shortcuts: shortcuts
	},
	markup: {
		class: ViewBoxType,
		viewType: "markup",
		prototype: new ListBox(markup, markupEd),
		container: true,
		tagName: "ui-list",
		shortcuts: shortcuts
	},
	line: {
		class: ViewBoxType,
		viewType: "line",
		prototype: new LineBox(line, textEd),
		container: false,
		tagName: "p",
		shortcuts: shortcuts
	},
	row: {
		class: ViewBoxType,
		viewType: "row",
		prototype: new RowBox(row, recordEd),
		container: false,
		tagName: "ui-row",
		shortcuts: shortcuts
	}
}
export default conf;