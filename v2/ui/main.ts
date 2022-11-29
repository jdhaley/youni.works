// import { Display } from "../base/display.js";
// import { ELE } from "../base/dom.js";
// import { start, TypeConf } from "../base/type.js";
// import { bundle } from "../base/util.js";
// import {IArticle, IEditor, IType} from "../control/editor.js";
// import { Frame } from "../control/frame.js";
// const shortcuts = {
// 	"Control+s": "save",
// 	"Tab": "next",
// 	"Alt+Tab": "next",
// 	"Shift+Tab": "previous",
// 	"Alt+Shift+Tab": "previous",
// 	"Control+,": "previous",
// 	"Control+.": "next",
// 	"Control+z": "undo",
// 	"Control+y": "redo",
// 	"Control+a": "selectAll",
// 	"Control+;": "insert"
// 	// "Control+b": "tag",
// 	// "Control+i": "tag",
// 	// "Control+u": "tag",
// 	// "Control+q": "tag",
// 	// "Control+/": "test"
// }

// let baseTypes: bundle<Display> = {
// 	record: {
// 		class: IType,
// 		prototype: new IEditor(record, actions.record, edit.record),
// 		tagName: "div",
// 		model: "record",
// 		shortcuts: shortcuts,
// 	},
// 	list: {
// 		class: IType,
// 		prototype: new IEditor(list, actions.list, edit.list),
// 		tagName: "div",
// 		model: "list",
// 		shortcuts: shortcuts
// 	},
// 	text: {
// 		class: IType,
// 		prototype: new IEditor(text, actions.text, edit.text),
// 		tagName: "div",
// 		model: "unit",
// 		shortcuts: shortcuts
// 	}
// }

// let types: bundle<TypeConf> = {
// 	task: {
// 		type: "record",
// 		title: "Task",
// 		types: {
// 			title: {
// 				type: "text",
// 				title: "Title",
// 			},
// 			owner: {
// 				type: "text",
// 				title: "Owner"
// 			},
// 			tasks: {
// 				type: "list",
// 				title: "Sub Tasks",
// 				types: {
// 					task: "task"
// 				}
// 			}
// 		}
// 	}
// }

// let frame = new Frame(window, controller);
// let article = new IArticle(frame);

// start(article, baseTypes, types);

// article.types.task.control(document.body as ELE).draw({
// 	title: "Get things working",
// 	owner: "John",
// });
