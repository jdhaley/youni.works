import {content} from "../../base/model.js";

import {Editable, Editor} from "./editor.js";
import { ListReplace } from "./list.js";
import {getContent, getEditableView, mark, unmark, narrowRange, getChildView} from "./util.js";

export default function edit(commandName: string, range: Range, content: string) {
	let view = getEditableView(range);
	if (view.$controller.model != "markup") console.warn("View is not markup:", view);
	let cmd = COMMANDS[commandName];
	if (!cmd) throw new Error("Unrecognized command");
	return cmd.call(this, commandName, range, content);
}

const COMMANDS = {
	"Cut": replace,
	"Paste": replace,
	"Insert": noop,

	"Entry": noop,
	"Erase": noop,
	"Delete": noop,
	"Promote": noop,
	"Demote": noop,
	"Split": noop,
	"Join": noop,
}

function noop() {
}

function replace(this: Editor, commandName: string, range: Range, content?: content): Range {
	let view = getEditableView(range);
	return new ReplaceMarkup(this.owner, commandName, view.id).exec(range, content);
}

interface Item {
	type$: string,
	content: string,
	id?: string,
	level?: number
}

function merge(item: Item, merge: Item, end: "before" | "after"): Item {
	if (merge?.content && item.type$ == merge.type$) {
		if (end == "before") {
			item.content += merge.content;
		} else {
			item.content = merge.content + item.content;
		}
		return item;
	}
}

class ReplaceMarkup extends ListReplace {
}
// class ReplaceMarkup extends ListReplace {
// 	onStartContainer(range: Range, content: content): void {
// 		let ctx = getContent(range);
// 		let start = getChildView(ctx, range.startContainer);
// 		if (start) {
// 			let r = range.cloneRange();
// 			r.setEnd(start, start.childNodes.length);
// 			this._clearContent(r);
// 			range.setStartAfter(start);
// 		}
// 	}
// 	onEndContainer(range: Range, content: content): void {
// 		let ctx = getContent(range);
// 		let end = getChildView(ctx, range.endContainer);
// 		if (end) {
// 			let r = range.cloneRange();
// 			r.setStart(end, 0);
// 			this._clearContent(r);
// 			range.setEndBefore(end);
// 		}
// 	}
// 	execAfter(range: Range, content: content): void {
// 		//	this._replace(this.owner, range, this.after);
// 			unmark(range);
// 	}
		
// 	_clearContent(range: Range) {
// 		range.deleteContents();
// 	}
// }
