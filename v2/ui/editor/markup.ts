import { content } from "../../base/model.js";
import { viewType } from "../../base/view.js";

import { Editable, Editor, getViewById } from "./editor.js";
import { ListReplace } from "./lr.js";
import { clearContent, getChildView, getContent, getEditableView } from "./util.js";


export default function edit(commandName: string, range: Range, content: string) {
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
	if (view.$controller.model == "line") {
		view = getEditableView(view.parentElement);
	}
	if (view.$controller.model != "markup") console.warn("View is not markup:", view);

	return new MarkupReplace(this.owner, commandName, view.id).exec(range, content);
}

interface Item {
	type$: string,
	content: string,
	id?: string,
	level?: number
}

class MarkupReplace extends ListReplace {
	protected getOuterRange(range: Range) {
		/*
			For markup, the replace range may come from a single line
			(due to merge & join of the start & end). In this case select
			the entire view so that the outer range is like a multi-item range.
		*/
		let view = getEditableView(range);
		if (view.$controller.model == "line") {
			range = range.cloneRange();
			range.selectNode(view);
			return range;
		}
		return super.getOuterRange(range);
	}	
	protected onSingleContainer(range: Range, content: content, part: Editable): void {
		range.deleteContents();
		let r = range.cloneRange();
		let ctx = getContent(part);
		let items = content as Item[];
		if (items[0]) {
			items[0].content = part.innerHTML + items[0].content;
		} else {
			items.push(part.$controller.toModel(part) as any);
		}
		range.setStartBefore(part);
		// 	let ctx = getContent(start);
// 	let r = range.cloneRange();
// 	r.setEnd(r.startContainer, r.startOffset - 1); //Exclude the start marker.
// 	r.setStart(ctx, 0);
// 	let item = start.$controller.toModel(start, r);
// 	let items = content as Item[];
// 	if (items[0]) {
// 		items[0].content = start.innerHTML + items[0].content;
// 	} else {
// 		items.push(start.$controller.toModel(start) as any);
// 	}
// //		r.deleteContents();
// 	range.setStartBefore(start);

	}
	protected onStartContainer(range: Range, content: content, start: Editable): void {
		let r = range.cloneRange();
		let ctx = getContent(start);
		r.setEnd(ctx, ctx.childNodes.length);
		r.deleteContents();
		let items = content as Item[];
		if (items[0]) {
			items[0].content = start.innerHTML + items[0].content;
		} else {
			items.push(start.$controller.toModel(start) as any);
		}
		range.setStartBefore(start);
	}
	protected onEndContainer(range: Range, content: content): void {
		let list = getViewById(this.owner, this.viewId);
		let ctx = getContent(list);
		let end = getChildView(ctx, range.endContainer);
		if (end) {
			let r = range.cloneRange();
			let ctx = getContent(end);
			r.setStart(ctx, 0);
			clearContent(r);
			merge(this, end, r, content, false);
			range.setEndBefore(end);
		}
	}
}

function merge(cmd: MarkupReplace, view: Editable, range: Range, content: any, isStart: boolean) {
	let item: Item = content?.length && content[isStart ? 0 : content.length - 1];
	if (!item) return;
	let listType = getViewById(cmd.owner, cmd.viewId).$controller;
	let type = listType.types[viewType(item)];
	if (type == view.$controller) {
		let node = 	view.ownerDocument.createTextNode(item.content);
		range.insertNode(node);
		if (isStart) {
			content.shift();
		} else {
			content.pop();
		}
	}
}