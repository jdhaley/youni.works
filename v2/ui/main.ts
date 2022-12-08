import { DisplayConf, Box, BoxType, Display } from "./display.js";
import { Signal } from "../base/controller.js";
import { start } from "../base/type.js";
import { bundle } from "../base/util.js";

import { IEditor } from "../control/editor.js";
import { Frame, UserEvent } from "./frame.js";

import { list } from "../control/viewers/list.js";
import { record } from "../control/viewers/record.js";
import { text } from "../control/viewers/text.js";

import controller from "./actions/frame.js";

import actions from "./conf/actions.js";
import edit from "./conf/edit.js";

import shape from "./actions/shape.js";
import { IArticle } from "./article.js";

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

let baseTypes: bundle<DisplayConf> = {
	record: {
		class: BoxType as any,
		prototype: new IEditor(record, edit.record),
		actions: actions.record,
		tagName: "div",
		model: "record",
		shortcuts: shortcuts,
	},
	list: {
		class: BoxType as any,
		prototype: new IEditor(list, edit.list),
		actions: actions.list,
		tagName: "div",
		model: "list",
		shortcuts: shortcuts
	},
	text: {
		class: BoxType as any,
		prototype: new IEditor(text, edit.text),
		actions: actions.text,
		tagName: "div",
		model: "unit",
		shortcuts: shortcuts
	},
	widget: {
		class: BoxType as any,
		prototype: new Display(),
		tagName: "div",
	},
	box: {
		class: BoxType as any,
		prototype: new Box(),
		tagName: "div",
	}
}

let types: bundle<DisplayConf> = {
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
		kind: "label",
		actions: {
			view(this: Box, signal: Signal) {
				this.view.textContent = this.partOf.type.conf.title;
			}
		},
		style: {
			".label": {
				font_size: "10pt",
				color: "gray"
			}
		}
	},
	field: {
		type: "box",
		types: {
			header: "label",
			body: "text"
		}
	},
	tasks: {
		type: "list",
		types: {
			task: "task"
		},
		style: {
			this: {
				border_radius: "3px",
				border: "1px solid lightsteelblue",
			},
			".dialog>.content": {
				display: "block",
			}
		},
		//actions: shape
	},
	task: {
		type: "record",
		title: "Task",
		types: {
			activity: {
				type: "field",
				title: "Activity",
				style: {
					this: {
						flex: "1 1 25%"
					}
				}
			},
			title: {
				type: "field",
				title: "Title",
				style: {
					this: {
						flex: "1 1 60%"
					}
				}
			},
			status: {
				type: "field",
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
				display: "flex",
				flex_direction: "row"
			}
		}
	},
	dialog: {
		type: "box",
		kind: "dialog",
		title: "Dialog",
		types: {
			header: "caption",
			body: "text"
		},
		style: {
			".dialog>.content": {
				padding: "4px",
				border: "0 solid gainsboro",
				border_width: "0 1px 1px 1px"
			}		
		},
		//actions: shape
	},
	caption:  {
		type: "box",
		types: {
			header: "widget",
			body: "label",
		},
		style: {
			this: {
				display: "flex",
				flex_direction: "row-reverse",
				background_color: "lightsteelblue",
				color: "white",
				padding: "3px 6px 3px 6px"
			},
			content: {
				flex: 1
			}				
		},
		actions: {
			view: function (this: Box, event: UserEvent) {
				this.body.view.textContent = "Dialog"; //this.partOf.type.conf.title;
			},
			click: function (this: Box, event: UserEvent) {
				if (event.target.getAttribute("data-cmd") == "edit") {
					(this.partOf as Box).content.textContent = "click edit";
				}
			}
		}
	},
	taskDialog:{
		type: "dialog",
		types: {
			body: "tasks"
		},
		style: {
			".label": `
				color: steelblue;
			`,
			".dialog>.content": `
				display: flex;
				flex-direction: row;
			`,
			".dialog>.content>*": `
				flex: 1;
			`
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

//let dialogue = article.types.taskDialog.create()
let tasks = article.types.taskDialog.create([
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
frame.view.append(tasks.view);
frame.send("view", frame.view);
frame.view.setAttribute("contenteditable", "true");