import { Display } from "../base/display.js";
import { ELE } from "../base/dom.js";
import { start } from "../base/type.js";
import { bundle } from "../base/util.js";

import { IArticle, IType } from "../control/box.js";
import { IEditor } from "../control/editor.js";
import { Frame } from "../control/frame.js";

import { list } from "../control/viewers/list.js";
import { record } from "../control/viewers/record.js";
import { text } from "../control/viewers/text.js";

import controller from "./actions/frame.js";

import actions from "./conf/actions.js";
import edit from "./conf/edit.js";

const shortcuts = {
	"Control+s": "save",
	"Tab": "next",
	"Alt+Tab": "next",
	"Shift+Tab": "previous",
	"Alt+Shift+Tab": "previous",
	"Control+,": "previous",
	"Control+.": "next",
	"Control+z": "undo",
	"Control+y": "redo",
	"Control+a": "selectAll",
	"Control+;": "insert"
	// "Control+b": "tag",
	// "Control+i": "tag",
	// "Control+u": "tag",
	// "Control+q": "tag",
	// "Control+/": "test"
}

let baseTypes: bundle<Display> = {
	record: {
		class: IType as any,
		prototype: new IEditor(record, actions.record, edit.record),
		tagName: "div",
		model: "record",
		shortcuts: shortcuts,
	},
	list: {
		class: IType as any,
		prototype: new IEditor(list, actions.list, edit.list),
		tagName: "div",
		model: "list",
		shortcuts: shortcuts
	},
	text: {
		class: IType as any,
		prototype: new IEditor(text, actions.text, edit.text),
		tagName: "div",
		model: "unit",
		shortcuts: shortcuts
	}
}

let types: bundle<Display> = {
	task: {
		type: "record",
		title: "Task",
		types: {
			title: {
				type: "text",
				title: "Title",
			},
			owner: {
				type: "text",
				title: "Owner"
			},
			tasks: {
				type: "list",
				title: "Sub Tasks",
				types: {
					task: "task"
				}
			}
		}
	}
}

let frame = new Frame(window, controller);
let article = new IArticle(frame, {
	baseTypes: baseTypes,
	viewTypes: types,
	sources: "/journal",
});

start(article, baseTypes, types);

article.types.task.control(document.body as ELE).draw({
	title: "Get things working",
	owner: "John",
});
