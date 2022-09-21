import {bundle} from "../../base/util.js";

import text from "../controllers/text.js";
import record from "../controllers/record.js";
import list from "../controllers/list.js";

import markup from "../controllers/markup.js";
import line from "../controllers/line.js";

import shortcuts from "./shortcuts.js";

import {DisplayConf, DisplayType} from "../display/display.js";

import { TextEditor } from "../editor/controls/text.js";
import { RecordEditor } from "../editor/controls/record.js";
import { ListEditor } from "../editor/controls/list.js";
import { MarkupEditor } from "../editor/controls/markup.js";
import { LineEditor } from "../editor/controls/line.js";

const conf: bundle<DisplayConf> = {
	text: {
		class: DisplayType,
		prototype: new TextEditor(text),
		model: "text",
		container: true,
		tagName: "ui-text",
		actions: text,
		shortcuts: shortcuts
	},
	record: {
		class: DisplayType,
		prototype: new RecordEditor(record),
		model: "record",
		container: true,
		tagName: "ui-record",
		actions: record,
		shortcuts: shortcuts
	},
	list: {
		class: DisplayType,
		prototype: new ListEditor(list),
		model: "list",
		container: true,
		tagName: "ui-list",
		actions: list,
		shortcuts: shortcuts
	},
	markup: {
		class: DisplayType,
		prototype: new MarkupEditor(markup),
		container: true,
		model: "markup",
		tagName: "ui-list",
		actions: markup,
		shortcuts: shortcuts
	},
	line: {
		class: DisplayType,
		prototype: new LineEditor(line),
		container: false,
		model: "line",
		tagName: "p",
		actions: line,
		shortcuts: shortcuts
	}
}
export default conf;