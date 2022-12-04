import { Signal } from "../base/controller.js";
import { Box, Display } from "../base/display.js";
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
		prototype: new IEditor(record, edit.record),
		actions: actions.record,
		tagName: "div",
		model: "record",
		shortcuts: shortcuts,
	},
	list: {
		class: IType as any,
		prototype: new IEditor(list, edit.list),
		actions: actions.list,
		tagName: "div",
		model: "list",
		shortcuts: shortcuts
	},
	text: {
		class: IType as any,
		prototype: new IEditor(text, edit.text),
		actions: actions.text,
		tagName: "div",
		model: "unit",
		shortcuts: shortcuts
	}
}

let types: bundle<Display> = {
	field: {
		type: "unit",
		style: {
			".field": {
				padding: "2px"
			},
			".field>.content": {
				border: "1px solid gainsboro"
			}
		}
	},
	caption: {
		type: "text",
		tagName: "header",
		actions: {
			view(this: Box, signal: Signal) {
				this.content.textContent = this.partOf.type.conf.title;
			}
		}
	},
	/*
dsp development: design responsibility questions: today: in progress
td teller: michael hoy meeting: done
td teller: odyssey architecture notes: in progress
td teller: feature spreadsheet iteration: done
ibm admin: reset password: done
ibm admin: update hours: postponed
*/
	task: {
		type: "record",
		title: "Task",
		types: {
			activity: {
				type: "text",
				header: "caption",
				title: "Activity",
				style: {
					this: {
						flex_width: "20%"
					}
				}
			},
			title: {
				type: "text",
				header: "caption",
				title: "Title",
			},
			status: {
				type: "text",
				header: "caption",
				title: "Status"
			},
			// tasks: {
			// 	type: "list",
			// 	header: "caption",
			// 	title: "Sub Tasks",
			// 	types: {
			// 		task: "task"
			// 	}
			// }
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
frame.send("view", frame.view);
frame.view.setAttribute("contenteditable", "true");