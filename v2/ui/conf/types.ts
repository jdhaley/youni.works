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
		container: true,
		tagName: "ui-text",
		shortcuts: shortcuts
	},
	record: {
		class: DisplayType,
		prototype: new RecordEditor(record),
		container: true,
		tagName: "ui-record",
		shortcuts: shortcuts
	},
	list: {
		class: DisplayType,
		prototype: new ListEditor(list),
		container: true,
		tagName: "ui-list",
		shortcuts: shortcuts
	},
	markup: {
		class: DisplayType,
		prototype: new MarkupEditor(markup),
		container: true,
		tagName: "ui-list",
		shortcuts: shortcuts
	},
	line: {
		class: DisplayType,
		prototype: new LineEditor(line),
		container: false,
		tagName: "p",
		shortcuts: shortcuts
	}
}
export default conf;