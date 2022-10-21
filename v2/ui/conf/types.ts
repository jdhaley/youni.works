import { bundle } from "../../base/util.js";

import { ViewTypeImpl } from "../../display/view.js";

import { TextBox } from "../../display/controls/text.js";
import { RecordBox } from "../../display/controls/record.js";
import { ListBox } from "../../display/controls/list.js";
import { LineBox } from "../../display/controls/line.js";
import { RowBox } from "../../display/controls/row.js";

import edit from "../../edit/conf/edit.js";
import actions from "../../edit/conf/actions.js";
import shortcuts from "./shortcuts.js";

export interface TypeConf {
	class: typeof ViewTypeImpl;
	viewType: string,
	prototype?: any,
	container: boolean;
	tagName: string;
	shortcuts: bundle<string>;
}

const conf: bundle<TypeConf> = {
	text: {
		class: ViewTypeImpl,
		viewType: "text",
		prototype: new TextBox(actions.text, edit.text),
		container: true,
		tagName: "ui-text",
		shortcuts: shortcuts
	},
	record: {
		class: ViewTypeImpl,
		viewType: "form",
		prototype: new RecordBox(actions.record, edit.record),
		container: true,
		tagName: "ui-record",
		shortcuts: shortcuts
	},
	list: {
		class: ViewTypeImpl,
		viewType: "list",
		prototype: new ListBox(actions.list, edit.list),
		container: true,
		tagName: "ui-list",
		shortcuts: shortcuts
	},
	markup: {
		class: ViewTypeImpl,
		viewType: "markup",
		prototype: new ListBox(actions.markup, edit.markup),
		container: true,
		tagName: "ui-list",
		shortcuts: shortcuts
	},
	line: {
		class: ViewTypeImpl,
		viewType: "line",
		prototype: new LineBox(actions.line, edit.text),
		container: false,
		tagName: "p",
		shortcuts: shortcuts
	},
	row: {
		class: ViewTypeImpl,
		viewType: "row",
		prototype: new RowBox(actions.row, edit.record),
		container: false,
		tagName: "ui-row",
		shortcuts: shortcuts
	}
}
export default conf;