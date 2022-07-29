import {BaseConf} from "../../base/loader.js";
import {bundle} from "../../base/util.js";

import text from "../controllers/text.js";
import record from "../controllers/record.js";
import list from "../controllers/list.js";

import shortcuts from "./shortcuts.js";
import {DisplayType} from "../display.js";
import {PanelType, Row, Table} from "../panel.js";

const conf: bundle<BaseConf> = {
	list: {
		class: DisplayType,
		model: "list",
		panel: true,
		tagName: "ui-list",
		actions: list,
		shortcuts: shortcuts
	},
	record: {
		class: DisplayType,
		model: "record",
		panel: true,
		tagName: "ui-record",
		actions: record,
		shortcuts: shortcuts
	},
	text: {
		class: DisplayType,
		model: "text",
		panel: true,
		tagName: "ui-text",
		actions: text,
		shortcuts: shortcuts
	},
	markup: {
		class: DisplayType,
		model: "text",
		panel: true,
		tagName: "ui-text",
		actions: text,
		shortcuts: shortcuts
	},
	form: {
		class: PanelType,
		model: "record",
		panel: true,
		tagName: "ui-record",
		actions: record,
		shortcuts: shortcuts
	},
	table: {
		class: Table,
		model: "list",
		panel: true,
		tagName: "ui-list",
		actions: list,
		shortcuts: shortcuts
	},
	row: {
		class: Row,
		model: "record",
		panel: true,
		tagName: "ui-record",
		actions: record,
		shortcuts: shortcuts
	},
	tree: {
		class: DisplayType,
		model: "list",
		panel: true,
		tagName: "ui-tree",
		actions: list,
		shortcuts: shortcuts
	}
}
export default conf;