import { Display, DisplayConf, Box, BoxType, DisplayType, NewBox } from "./display.js";
import { Actions, Signal } from "../base/controller.js";
import { bundle, EMPTY } from "../base/util.js";

import { IEditor } from "../control/editorControl.js";
import { Frame, UserEvent } from "./frame.js";

import { list } from "../control/viewers/listViewer.js";
import { record } from "../control/viewers/recordViewer.js";
import { text } from "../control/viewers/textViewer.js";

import controller from "./actions/frame.js";

import actions from "./conf/actions.js";
import edit from "./conf/editorConf.js";

import shape from "./actions/shape.js";
import { IArticle } from "./article.js";
import { BaseConf, View, VType } from "../control/view.js";

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

let baseTypes: bundle<BaseConf> = {
	record: {
		class: DisplayType as any,
		prototype: new IEditor(record, edit.record),
		actions: actions.record,
		tagName: "div",
		model: "record",
		shortcuts: shortcuts,
	},
	list: {
		class: DisplayType as any,
		prototype: new IEditor(list, edit.list),
		actions: actions.list,
		tagName: "div",
		model: "list",
		shortcuts: shortcuts
	},
	text: {
		class: DisplayType as any,
		prototype: new IEditor(text, edit.text),
		actions: actions.text,
		tagName: "div",
		model: "unit",
		shortcuts: shortcuts
	},
	display: {
		class: DisplayType as any,
		prototype: new Display(),
		actions: EMPTY.object,
		tagName: "div",
		model: "",
		shortcuts: shortcuts
	},
	box: {
		class: BoxType as any,
		prototype: new NewBox(),
		actions: EMPTY.object,
		tagName: "div",
		model: "",
		shortcuts: shortcuts
	}
}

let types: bundle<DisplayConf> = {
	styles: {
		type: "display",
		styles: {
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
		type: "display",
		kind: "label",
		actions: {
			view(this: Box, signal: Signal) {
				this.view.textContent = this.partOf.type.conf.title;
			}
		},
		styles: {
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
		styles: {
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
				styles: {
					this: {
						flex: "1 1 25%"
					}
				}
			},
			title: {
				type: "field",
				title: "Title",
				styles: {
					this: {
						flex: "1 1 60%"
					}
				}
			},
			status: {
				type: "field",
				title: "Status",
				styles: {
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
		styles: {
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
		styles: {
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
			header: "display",
			body: "label",
		},
		styles: {
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
			view: function (this: NewBox, event: UserEvent) {
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
		styles: {
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

let value = [
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
	}
];
//let dialogue = article.types.taskDialog.create()
let tasks = article.types.taskDialog.create();
frame.view.append(tasks.view);
tasks.draw(value);
frame.send("view", frame.view);
frame.view.setAttribute("contenteditable", "true");