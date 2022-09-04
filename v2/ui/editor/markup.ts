import { content } from "../../base/model.js";
import { viewType } from "../../base/view.js";

import { Editable, Editor, getViewById } from "./editor.js";
import { ListReplace } from "./lr.js";
import { getContent, getEditableView, mark, unmark } from "./util.js";

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
		range = unmark(range);
		
		let ctx = getContent(part);
		let r = range.cloneRange();
		r.deleteContents();
		r.setEnd(ctx, ctx.childNodes.length);
		let splitted = part.$controller.toView(part.$controller.toModel(part, r));
		r.deleteContents();
		this.merge(part, r, content, true);

		part.parentElement.insertBefore(splitted, part.nextElementSibling);
		range.setEnd(splitted, 0);
		mark(range);
		range.collapse();

		r.setStart(splitted, 0);
		r.collapse(true);
		if (!(this.name == "Split")) this.merge(splitted, r, content, false);
		//range.setStart(part, part.childNodes.length);
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
	//Issue with the following logic breaking the record lists.
	//TODO this is just copied.  Best to understand better & resolve.
	protected onInnerRange(range: Range, content: content): void {
		range = range.cloneRange();
		range.deleteContents();
		if (!content) return;
		let list = getViewById(this.owner, this.viewId);
		//Insertion range must be on the list container. If in a markup line, pop-up until it is.
		while (range.commonAncestorContainer != list) {
			range.setStartBefore(range.commonAncestorContainer);
			range.collapse(true);
		}
		let views = list.$controller.getContentOf(list.$controller.toView(content));
		while (views.firstChild) {
			range.insertNode(views.firstChild);
			range.collapse();
		}
	}
}
