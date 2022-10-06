import { Editor } from "../../base/editor.js";
import { bundle } from "../../base/util.js";

import { ViewBoxType } from "../../box/box.js";

import { TextEditor } from "../../editor/controls/text.js";
import { RecordEditor } from "../../editor/controls/record.js";
import { ListEditor } from "../../editor/controls/list.js";
import { MarkupEditor } from "../../editor/controls/markup.js";
import { LineEditor } from "../../editor/controls/line.js";
import { RowEditor } from "../../editor/controls/row.js";

import text from "../controllers/text.js";
import record from "../controllers/record.js";
import list from "../controllers/list.js";
import markup from "../controllers/markup.js";
import line from "../controllers/line.js";
import row from "../controllers/row.js";

import textEd from "../../editor/editors/text.js";
import recordEd from "../../editor/editors/markup.js";
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
		prototype: new TextEditor(text, textEd),
		container: true,
		tagName: "ui-text",
		shortcuts: shortcuts
	},
	record: {
		class: ViewBoxType,
		prototype: new RecordEditor(record, recordEd),
		container: true,
		tagName: "ui-record",
		shortcuts: shortcuts
	},
	list: {
		class: ViewBoxType,
		prototype: new ListEditor(list, listEd),
		container: true,
		tagName: "ui-list",
		shortcuts: shortcuts
	},
	markup: {
		class: ViewBoxType,
		prototype: new MarkupEditor(markup, markupEd),
		container: true,
		tagName: "ui-list",
		shortcuts: shortcuts
	},
	line: {
		class: ViewBoxType,
		prototype: new LineEditor(line, textEd),
		container: false,
		tagName: "p",
		shortcuts: shortcuts
	},
	row: {
		class: ViewBoxType,
		prototype: new RowEditor(row, recordEd),
		container: false,
		tagName: "ui-row",
		shortcuts: shortcuts
	}
}
export default conf;