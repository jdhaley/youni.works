import {content} from "../../../base/model.js";
import { Article, Replace, ReplaceRange, StdReplace } from "../editor.js";

import {Editable, Editor} from "../editor.js";
import {getContent, getEditableView, mark, unmark, narrowRange, getChildView} from "../util.js";

export default function edit(commandName: string, range: Range, content: string) {
	let view = getEditableView(range);
	if (view.$controller.model != "note") console.warn("View is not a note:", view);
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
	return new NoteEdit(this.owner, commandName, view.id).exec(range, content);
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

class NoteEdit extends StdReplace {
	doBefore(range: Range, content: content): void {
		narrowRange(range);
		mark(range);
		let ctx = getContent(range);
		//NB - the edit extent range is a different range from the
		//passed range and should only be used within this method.
		range = getEditExtent(ctx, range);
		recordRange(this, ctx, range);
	
		//Capture the before image for undo.
		let before = "";
		for (let i = range.startOffset; i < range.endOffset; i++) {
			let node = ctx.childNodes[i] as Element;
			if (node.outerHTML) before += node.outerHTML;
		}
		this.before = before;

		/**
		 * Returns a range of the direct descendent views of the list content.
		 * @param ctx 
		 * @param range 
		 */
		function getEditExtent(ctx: Element, range: Range) {
			range = range.cloneRange();
			let start = getChildView(ctx, range.startContainer);
			if (start) range.setStartBefore(start);
			let end = getChildView(ctx, range.endContainer);
			if (end) range.setEndAfter(end);

			if (!(range.startContainer == ctx && range.endContainer == ctx)) {
				throw new Error("Invalid range for edit.");
			}
			return range;
		}
		/**
		 * Finds the views before the range start (if any) and after the range end (if any).
		 * Record their ids in the command.
		 * This is used to get the extent of the list to be replaced by undo & redo.
		 * @param cmd 
		 * @param ctx 
		 * @param range 
		 */
		function recordRange(cmd: ReplaceRange, ctx: Element, range: Range) {
			for (let i = range.startOffset; i; i--) {
				let node = ctx.childNodes[i - 1] as Editable;
				if (node.getAttribute("data-item")) {
					cmd.startId = node.id;
					break;
				}
			}
			for (let i = range.endOffset; i < ctx.childNodes.length; i++) {
				let node = ctx.childNodes[i] as Editable;
				if (node.getAttribute("data-item")) {
					cmd.endId = node.id;
					break;
				}
			}
		}
	}
	doStartContainer(range: Range, content: content): void {
		let ctx = getContent(range);
		let start = getChildView(ctx, range.startContainer);
		if (start) {
			let r = range.cloneRange();
			r.setEnd(start, start.childNodes.length);
			this._clearContent(r);
			range.setStartBefore(start);
			this.after = start.outerHTML;
		} else {
			this.after = "";
		}
	}
	doMiddle(range: Range, content: content): void {
		if (!content) return;
		let editor = getEditableView(range).$controller;
		this.after += editor.getContentOf(editor.toView(content)).innerHTML;
	}
	doEndContainer(range: Range, content: content): void {
		let ctx = getContent(range);
		let end = getChildView(ctx, range.endContainer);
		if (end) {
			let r = range.cloneRange();
			r.setStart(end, 0);
			this._clearContent(r);
			range.setEndAfter(end);
			this.after += end.outerHTML;
		}
	}
	doAfter(range: Range, content: content): void {
		//this._replace(this.owner, range, this.after);
		unmark(range);
	}
	_clearContent(range: Range) {
		range.deleteContents();
	}
	_replace(article: Article, range: Range, markup: string) {
		let div = range.commonAncestorContainer.ownerDocument.createElement("div");
		div.innerHTML = markup;
		range.deleteContents();
		while (div.firstChild) {
			let node = div.firstChild;
			range.insertNode(node);
			range.collapse();
			if (node.nodeType == Node.ELEMENT_NODE) {
				article.bindView(node as any);
			}
		}
	}
}
