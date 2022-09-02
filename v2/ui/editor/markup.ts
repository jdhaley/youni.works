import { content } from "../../base/model.js";
import { viewType } from "../../base/view.js";

import { Editable, Editor, getViewById } from "./editor.js";
import { ListReplace } from "./lr.js";
import { clearContent, getChildView, getContent, getEditableView, unmark } from "./util.js";


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
	"Erase": replace,
	"Delete": noop,
	"Promote": noop,
	"Demote": noop,
	"Split": replace,
	"Join": replace,
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
		unmark(range);
		let ctx = getContent(part);
		let r = range.cloneRange();
		r.deleteContents();
		r.setEnd(ctx, ctx.childNodes.length);
		let item: Item = part.$controller.toModel(part, r) as any;
		r.deleteContents();
		// let items = content as Item[];
		// items.push(item);
		this.merge(part, r, content, true);
		range.setEndAfter(part);

		let x: Editable = (part as Element).cloneNode() as Editable;
		x.$controller = part.$controller;
		x.innerHTML = item.content;
		part.parentElement.insertBefore(x, part.nextElementSibling);
		r.setEnd(x, 0);
		r.collapse();
		if (!(this.name == "Split")) this.merge(x, r, content, false);
		range.collapse();
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
	protected merge(view: Editable, range: Range, content: any, isStart: boolean) {
		let item: Item = content?.length && content[isStart ? 0 : content.length - 1];
		if (!item) return;
		let listType = getViewById(this.owner, this.viewId).$controller;
		let type = listType.types[viewType(item)];
		if (type == view.$controller) {
			if (item.content) {
				let node = 	view.ownerDocument.createTextNode(item.content);
				range.insertNode(node);	
			}
			if (isStart) {
				content.shift();
			} else {
				content.pop();
			}
		}
	}
}
