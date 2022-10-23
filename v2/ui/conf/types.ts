import { bundle } from "../../base/util.js";

import { TextBox } from "../controls/text.js";
import { RecordBox } from "../controls/record.js";
import { ListBox } from "../controls/list.js";
import { LineBox } from "../controls/line.js";
import { RowBox } from "../controls/row.js";

import { ElementViewType } from "../../display/view.js";

import edit from "./edit.js";
import actions from "./actions.js";
import shortcuts from "./shortcuts.js";

export interface TypeConf {
	class: typeof ElementViewType;
	viewType: string,
	prototype?: any,
	container: boolean;
	tagName: string;
	shortcuts: bundle<string>;
}

const conf: bundle<TypeConf> = {
	text: {
		class: ElementViewType,
		viewType: "text",
		prototype: new TextBox(actions.text, edit.text),
		container: true,
		tagName: "ui-text",
		shortcuts: shortcuts
	},
	record: {
		class: ElementViewType,
		viewType: "form",
		prototype: new RecordBox(actions.record, edit.record),
		container: true,
		tagName: "ui-record",
		shortcuts: shortcuts
	},
	list: {
		class: ElementViewType,
		viewType: "list",
		prototype: new ListBox(actions.list, edit.list),
		container: true,
		tagName: "ui-list",
		shortcuts: shortcuts
	},
	markup: {
		class: ElementViewType,
		viewType: "markup",
		prototype: new ListBox(actions.markup, edit.markup),
		container: true,
		tagName: "ui-list",
		shortcuts: shortcuts
	},
	line: {
		class: ElementViewType,
		viewType: "line",
		prototype: new LineBox(actions.line, edit.text),
		container: false,
		tagName: "p",
		shortcuts: shortcuts
	},
	row: {
		class: ElementViewType,
		viewType: "row",
		prototype: new RowBox(actions.row, edit.record),
		container: false,
		tagName: "ui-row",
		shortcuts: shortcuts
	}
}
export default conf;