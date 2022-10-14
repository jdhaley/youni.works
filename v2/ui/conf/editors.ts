import { Editor } from "../../base/editor.js";
import { bundle } from "../../base/util.js";

import { ViewBoxType } from "../../box/view.js";

import { TextBox } from "../../box/controls/text.js";
import { RecordBox } from "../../box/controls/record.js";
import { ListBox } from "../../box/controls/list.js";
import { MarkupBox } from "../../box/controls/markup.js";
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
	prototype?: Editor,
	container: boolean;
	tagName: string;
	shortcuts: bundle<string>;
}

const conf: bundle<TypeConf> = {
	text: {
		class: ViewBoxType,
		prototype: new TextBox(text, textEd),
		container: true,
		tagName: "ui-text",
		shortcuts: shortcuts
	},
	record: {
		class: ViewBoxType,
		prototype: new RecordBox(record, recordEd),
		container: true,
		tagName: "ui-record",
		shortcuts: shortcuts
	},
	list: {
		class: ViewBoxType,
		prototype: new ListBox(list, listEd),
		container: true,
		tagName: "ui-list",
		shortcuts: shortcuts
	},
	markup: {
		class: ViewBoxType,
		prototype: new MarkupBox(markup, markupEd),
		container: true,
		tagName: "ui-list",
		shortcuts: shortcuts
	},
	line: {
		class: ViewBoxType,
		prototype: new LineBox(line, textEd),
		container: false,
		tagName: "p",
		shortcuts: shortcuts
	},
	row: {
		class: ViewBoxType,
		prototype: new RowBox(row, recordEd),
		container: false,
		tagName: "ui-row",
		shortcuts: shortcuts
	}
}
export default conf;