import { ElementType } from "../../base/dom.js";
import {content} from "../../base/model.js";
import { viewType } from "../../base/view.js";

import { Editable, Editor, getViewById } from "./editor.js";
import { ListReplace } from "./lr.js";
import { clearContent, getChildView, getContent, getEditableView } from "./util.js";


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
	return new MarkupReplace(this.owner, commandName, view.id).exec(range, content);
}

interface Item {
	type$: string,
	content: string,
	id?: string,
	level?: number
}

class MarkupReplace extends ListReplace {
	protected onStartContainer(range: Range, content: content): void {
		let ctx = getContent(range);
		let start = getChildView(ctx, range.startContainer);
		if (start) {
			let r = range.cloneRange();
			let ctx = getContent(start);
			r.setEnd(ctx, ctx.childNodes.length);
			clearContent(r);
			merge(this, start, r, content, true)
			range.setStartAfter(start);
		}
	}
	protected onEndContainer(range: Range, content: content): void {
		let ctx = getContent(range);
		let end = getChildView(ctx, range.endContainer);
		if (end) {
			let r = range.cloneRange();
			let ctx = getContent(end);
			r.setStart(ctx, 0);
			clearContent(r);
			merge(this, end, r, content, true)
			range.setEndBefore(end);
		}
	}
}

function merge(cmd: MarkupReplace, view: Editable, range: Range, content: any, isStart: boolean) {
	let item: Item = content?.length && content[isStart ? 0 : content.length - 1];
	if (!item) return;
	let markupType = getViewById(cmd.owner, cmd.viewId).$controller;
	let type = markupType.types[viewType(item)];
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