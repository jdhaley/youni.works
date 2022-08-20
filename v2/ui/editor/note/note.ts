import {content} from "../../../base/model.js";
import { Article, RangeEdit, Edit } from "../editor.js";

import {Editable, Editor} from "../editor.js";
import {getContent, getEditableView, mark, unmark, narrowRange} from "../util.js";

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
export default function edit(commandName: string, range: Range, content: string) {
	let view = getEditableView(range);
	if (view.$controller.model != "note") console.warn("View is not a note:", view);
	let cmd = COMMANDS[commandName];
	if (!cmd) throw new Error("Unrecognized command");
	return cmd.call(this, commandName, range, content);
}

const COMMONOPS = {
	getView: getEditableView,
	getContent: getContent
}
const OPS = {
	doReplace: doReplace,
		narrowRange: narrowRange,
		getEditableView: getEditableView,
		mark: mark,
		unmark: mark,
	beforeImage: beforeImage,
		getEditExtent: getEditExtent,
		recordRange: recordRange,
		isAtStart: null,
	afterImage: afterImage,
		handleStart: handleStartContainer,
		handleEnd: handleEndContainer,
		toMarkup: toMarkup,
		getNoteItem: getNoteItem,
		clearContent: clearContent,
		isAtEnd: null,
	merge: null,
	replace: replace
}
const COMMANDS = {
	"Cut": doReplace,
	"Paste": doReplace,
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

function doReplace(this: Editor, commandName: string, range: Range, content?: content): Range {
	let view = getEditableView(range);

	let cmd = new RangeEdit(this.owner, commandName, view.id);

	narrowRange(range);

	mark(range);
	cmd.before = beforeImage(cmd, range);
	cmd.after = afterImage(range, content);
	replace(cmd.owner, range, cmd.after);
	unmark(range);
	return range;
}
function replace(article: Article, range: Range, markup: string) {
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

function toMarkup(editor: Editor, content: content) {
	if (!content) return "";
	return editor.getContentOf(editor.toView(content)).innerHTML;
}

function clearContent(range: Range) {
	range.deleteContents();
}
function handleStartContainer(ctx: Element, range: Range, content: content) {
	let start = getNoteItem(ctx, range.startContainer);
	if (start) {
		let r = range.cloneRange();
		r.setEnd(start, start.childNodes.length);
		clearContent(r);
		range.setStartBefore(start);
		return start.outerHTML;
	}
	return "";
}

function handleEndContainer(ctx: Element, range: Range, content: content) {
	let end = getNoteItem(ctx, range.endContainer);
	if (end) {
		let r = range.cloneRange();
		r.setStart(end, 0);
		clearContent(r);
		range.setEndAfter(end);
		return end.outerHTML;
	}
	return "";
}

/**
 * Records the edit extent and captures the before image for undo.
 * @param cmd 
 * @param range 
 */
function beforeImage(cmd: RangeEdit, range: Range): string {
	let view = getEditableView(range);
	let ctx = getContent(view);
	//NB - the edit extent range is a different range from the
	//passed range and should only be used within this method.
	range = getEditExtent(ctx, range);
	recordRange(cmd, ctx, range);

	//Capture the before image for undo.
	let before = "";
	for (let i = range.startOffset; i < range.endOffset; i++) {
		let node = ctx.childNodes[i] as Element;
		if (node.outerHTML) before += node.outerHTML;
	}
	return before;
}

function afterImage(range: Range, content: content): string {
	let ctx = getContent(range);
	let view = getEditableView(range);
	let after = handleStartContainer(ctx, range, content);
	after += toMarkup(view.$controller, content);;
	after += handleEndContainer(ctx, range, content);
	return after;
}
/**
 * Finds the views before the range start (if any) and after the range end (if any).
 * Record their ids in the command.
 * This is used to get the extent of the list to be replaced by undo & redo.
 * @param cmd 
 * @param ctx 
 * @param range 
 */
function recordRange(cmd: RangeEdit, ctx: Element, range: Range) {
	for (let i = range.startOffset; i; i--) {
		let node = ctx.childNodes[i - 1] as Editable;
		if (node.$controller) {
			cmd.startId = node.id;
			break;
		}
	}
	for (let i = range.endOffset; i < ctx.childNodes.length; i++) {
		let node = ctx.childNodes[i] as Editable;
		if (node.$controller) {
			cmd.endId = node.id;
			break;
		}
	}
}

/**
 * Returns a range of the direct descendent views of the list content.
 * @param ctx 
 * @param range 
 */
function getEditExtent(ctx: Element, range: Range) {
	range = range.cloneRange();
	let start = getNoteItem(ctx, range.startContainer);
	if (start) range.setStartBefore(start);
	let end = getNoteItem(ctx, range.endContainer);
	if (end) range.setEndAfter(end);

	if (!(range.startContainer == ctx && range.endContainer == ctx)) {
		throw new Error("Invalid range for edit.");
	}
	return range;
}

let items = {
// 	getOwner(node: Node | Range): Owner {
// //		return Owner.of(node);
// 		return undefined;
// 	},
	//RW getContent()
	getItems(node: Node | Range): Element {
		if (node instanceof Range) node = node.commonAncestorContainer;
		while (node) {
			if (node["$editor"])  return node as Element;
			node = node.parentNode;
		}
	},
	getSection(node: Node | Range): Element {
		if (node instanceof Range) node = node.commonAncestorContainer;
		let ele = this.getItem(node);
		while (ele) {
			if (this.getRole(ele) == "heading") return ele;
			ele = ele.previousElementSibling;
		}
	},
	//rw getChildView
	getItem(node: Node | Range): Element {
		if (node instanceof Range) node = node.commonAncestorContainer;
		let ele = node as Element;
		let items = this.getItems(node);
		if (items) while (ele) {
			if (ele.parentElement == items) return ele;
			ele = ele.parentElement;
		}
		return null;
	},
	setItem(item: Element, role: string, level: number) {
		// if (this.getItem(item) != item) {
		// 	console.error("Argument is not an Item.");
		// 	return;
		// }
		this.getOwner(item).getId(item); //Ensure the item's id is set as well.
		if (!role) {
			item.removeAttribute("role");
		} else {
			item.setAttribute("role", role);
		}
		if (!level) {
			item.removeAttribute("aria-level");
		} else {
			item.setAttribute("aria-level", "" + level);
		}
	},
	getRole(item: Element) {
		return item?.getAttribute("role") || "";
	},
	getLevel(item: Element) {
		return (item?.ariaLevel as any) * 1 || 0;
	},
	getItemRange(article: Element, startId: string, endId: string) {
		let range = article.ownerDocument.createRange();
		range.selectNodeContents(article);
		if (startId) {
			let start = article.ownerDocument.getElementById(startId);
			if (!start) throw new Error(`Start item.id '${startId}' not found.`);
			range.setStartAfter(start);
		}
		if (endId) {
			let end = article.ownerDocument.getElementById(endId);
			if (!end) throw new Error(`End item.id '${endId}' not found.`);
			range.setEndBefore(end);
		}
		return range;
	},
	toTextLines(range: Range): string {
		let out = "";
		let items = this.getItems(range);
		if (range.commonAncestorContainer == items) {
			for (let item of range.cloneContents().childNodes) {
				out += item.textContent + "\r\n";
			}
		} else {
			out = range.cloneContents().textContent;
		}
		return out;
	},
	itemsFromText(doc: Document, text: string) {
		let i = 0;
		let out = doc.createElement("DIV");
		while (i < text.length) {
			let idx = text.indexOf("\n", i + 1);
			if (idx < 0) idx = text.length;
			let item = doc.createElement("P");
			item.textContent = text.substring(i, idx);
			out.append(item);
			i = idx;
		}
		return out;
	}
}
function getNoteItem(content: Element, node: Node): Element {
	if (node == content) return null;
	while (node?.parentElement != content) {
		node = node.parentElement;
	}
	//Assume marker id won't interfer or define an attribute to identify a line.
	if (!node || !node["id"]) {
		throw new Error("Note child has no id");
	}
	return node as Element;
}
