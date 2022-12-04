import { Signal } from "../base/controller.js";
import { Box, Display } from "../base/display.js";
import { ELE } from "../base/dom.js";
import { start } from "../base/type.js";
import { bundle } from "../base/util.js";

import { IArticle, IBox, IType } from "../control/box.js";
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
	},
	widget: {
		class: IType as any,
		prototype: new IBox(),
		tagName: "div",
	}
}

let types: bundle<Display> = {
	styles: {
		type: "unit",
		style: {
			".field": {
				padding: "2px"
			},
			".field>.content": {
				border: "1px solid gainsboro",
				border_radius: "3px",
				padding: "2px",
				min_height: "21px"
			},
			body: {
				display: "block"
			}
		}
	},
	label: {
		type: "widget",
		tagName: "header",
		actions: {
			view(this: Box, signal: Signal) {
				this.content.textContent = this.partOf.type.conf.title;
			}
		},
		style: {
			this: {
				font_size: "10pt",
				color: "gray"
			}
		}
	},
	tasks: {
		type: "list",
		types: {
			task: "task"
		},
		style: {
			this: {
				display: "block"
			}
		}
	},
	task: {
		type: "record",
		title: "Task",
		types: {
			activity: {
				type: "text",
				header: "label",
				title: "Activity",
				style: {
					this: {
						flex: "1 1 25%"
					}
				}
			},
			title: {
				type: "text",
				header: "label",
				title: "Title",
				style: {
					this: {
						flex: "1 1 60%"
					}
				}
			},
			status: {
				type: "text",
				header: "label",
				title: "Status",
				style: {
					this: {
						flex: "1 1 15%"
					}
				}
			},
			// tasks: {
			// 	type: "list",
			// 	header: "label",
			// 	title: "Sub Tasks",
			// 	types: {
			// 		task: "task"
			// 	}
			// }
		},
		style: {
			this: {
				display: "flex"
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

article.types.tasks.control(document.body as ELE).draw([
		/*
dsp development: design responsibility questions: today: in progress
td teller: michael hoy meeting: done
td teller: odyssey architecture notes: in progress
td teller: feature spreadsheet iteration: done
ibm admin: reset password: done
ibm admin: update hours: postponed
*/
	{
		type$: "task",
		activity: "dsp dev",
		title: "get things working",
		status: "in progress",
	},
	{
		type$: "task",
		activity: "td teller",
		title: "m. hoy meeting",
		status: "done",
	},
	{
		type$: "task",
		activity: "td teller",
		title: "spreadsheet iteration",
		status: "done",
	},
	{
		type$: "task",
		activity: "ibm admin",
		title: "update hours",
		status: "postponed",
	},
]);
frame.send("view", frame.view);
frame.view.setAttribute("contenteditable", "true");