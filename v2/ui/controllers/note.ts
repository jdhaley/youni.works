import {extend} from "../../base/util.js";
import {CommandBuffer} from "../../base/command.js";

import {Frame, UserEvent} from "../ui.js";
import {getContent} from "../editor/util.js";

import items from "../../devt/note/items/items.js";
import text from "../../devt/note/items/text.js";

import baseController from "./editable.js";

/***************
 Priorities:
 	toView
	toModel
	get & set clipboard
 ***************/
// import { Controller, Receiver } from "../../base/controller.js";
// import { content } from "../../base/model.js";
// import { CommandBuffer } from "../../base/command.js";

// interface Editable extends Element {
// 	$controller?: Editor
// }
// interface Editor extends Controller<content, Editable>  {
// 	readonly model: string;
// 	readonly owner: Article;
// 	toModel(view: Element, range?: Range, id?: true): content;
// 	getContentOf(node: Node): Element;
// 	edit(commandName: string, range: Range, content?: content): Range;
// }

// interface Article extends Receiver {
// 	readonly commands: CommandBuffer<Range>;
// 	bindView(element: Element): void;
// 	getView(viewId: string): Editable;
// 	setRange(range: Range, collapse?: boolean): void;
// }

/* RangeCommands is the implementation */
import {RangeCommands} from "../../devt/note/items/editor.js";
import { setClipboard } from "../clipboard.js";
import { ElementType } from "../../base/dom.js";

interface NoteOwner {
	frame: Frame;
	commands: CommandBuffer<Range>;
	markup(x: string | Range): string;
}

interface Note /* Editor */ {
	owner: NoteOwner;
	//transform: any;
	toView(model: string): Element;
	//toModel(view: Element, range?: Range): content;
	
	//Standard editor inteface.
	edit(commandName: string, range: Range, content?: string): Range;

	/////// extended editor commands /////////

	//Might be able to factor out using the text editor command.
	editText(name: string, range: Range, content: string, offset: number): Range;

	insert(range: Range): Range;
	split(range: Range): Range;
	level(name: "Promote" | "Demote", range: Range): Range;

}

function navigateToText(range: Range, direction: "prior" | "next"): Range {
	let note = getContent(range);
	let node = range.commonAncestorContainer;
	if (node == note) {
		node = note.childNodes[range.startOffset];
		if (!node) return null;
		node = direction == "prior" ? text.lastText(node) : text.firstText(node);
	} else {
		node = direction == "prior" ? text.priorText(node) : text.nextText(node);
	}
	if (node?.nodeType == Node.TEXT_NODE) {
		range.selectNodeContents(node);
		range.collapse(direction == "prior" ? false : true);
		return range;
	}
	return null;	
}
///////////////////////////
const tag = {
	"b": "STRONG",
	"i": "EM",
	"u": "CITE"
}

export default extend(baseController, {
	cut(this: Note, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		if (range.collapsed) return;
/*	REPLACE:
		let source = range.commonAncestorContainer.ownerDocument.createElement("DIV");
		source.innerHTML = this.owner.markup(range);
		let target = this.transform.fromView(source) as HTMLElement;
		event.clipboardData.setData("text/html", target.innerHTML);
		event.clipboardData.setData("text/plain", items.toTextLines(range));
	WITH */
		setClipboard(this as any, range, event.clipboardData);
		this.edit("Cut", range, "");
	},
	copy(this: Note, event: UserEvent) {
		event.subject = "";
		let range = event.range;
/*	REPLACE:
		let source = this.owner.frame.createElement("DIV");
		source.innerHTML = this.owner.markup(range);
		let target = this.transform.fromView(source) as HTMLElement;
		event.clipboardData.setData("text/html", target.innerHTML);
		event.clipboardData.setData("text/plain", items.toTextLines(range));
	WITH */
		setClipboard(this as any, range, event.clipboardData);
	},
	paste(this: Note, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		let data = event.clipboardData.getData("text/html");
		if (data) {
			data = this.toView(data).innerHTML;
		} else {
			data = event.clipboardData.getData("text/plain");
			if (!data) return console.warn("no data to paste");	
			if (data.indexOf("\n")) {
				data = items.itemsFromText(event.on.ownerDocument, data).innerHTML;
			}
		}
		this.edit("Paste", range, data);
		range.collapse();
	},
	charpress(this: Note, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		if (!range.collapsed) {
			/* TODO The range's start after the replace is from
				the start of the item (or text node) - not the actual selected range.
				This i think is a limitation of the replace algo.  There's not much harm here
				particularly when we collapse the range.
			*/
			this.edit("Replace", range, `<P>${event.key}</P>`);
			range.collapse();
			return;
		}
		let node = range.commonAncestorContainer;
		if (node.nodeType != Node.TEXT_NODE) {
			let to = navigateToText(range, "next");
			if (!to) to = navigateToText(range, "prior");
			if (to) {
				range = to;
			} else {
				range.selectNodeContents(items.getItems(range));
				range.collapse(true);
				let value = event.key == " " ? "\xa0" : event.key;
				this.edit("Insert", range, "<P>" + value + "</P>");
				to = range;
			}
		}

		let offset = range.startOffset;
		let text = range.commonAncestorContainer.textContent;
		text = text.substring(0, offset) + event.key + text.substring(offset);
		this.editText("Enter-Text", range, text, offset + 1);
	},
	delete(this: Note, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		if (!range.collapsed) {
			this.edit("Delete", range, "");
			return;
		} 
		let node = range.commonAncestorContainer;
		if (node.nodeType != Node.TEXT_NODE || range.startOffset >= node.textContent.length) {
			range = navigateToText(range, "next");
			if (!range) return console.warn("cant navigate to text node.");
		}
		if (items.getItem(range.commonAncestorContainer) != items.getItem(node)) {
			range.setStartAfter(items.getItem(node).lastChild);
			this.edit("Join", range, "");
			return;
		}

		let offset = range.startOffset;
		let text = range.commonAncestorContainer.textContent;
		if (offset >= text.length) return;
		text = text.substring(0, offset) + text.substring(offset + 1);
		this.editText("Delete-Text", range, text, offset);
	},
	erase(this: Note, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		if (!range.collapsed) {
			this.edit("Delete", range, "");
			return;
		}
		let node = range.commonAncestorContainer;
		if (node.nodeType != Node.TEXT_NODE || range.startOffset == 0) {
			range = navigateToText(range, "prior");
			if (!range) return console.warn("cant navigate to text node.");
		}
		if (items.getItem(range.commonAncestorContainer) != items.getItem(node)) {
			range.setEndBefore(items.getItem(node).firstChild);
			this.edit("Join", range, "");
			return;
		}
		let offset = range.startOffset;
		let text = range.commonAncestorContainer.textContent;
		if (offset < 1) return;
		text = text.substring(0, offset - 1) + text.substring(offset);
		this.editText("Erase-Text", range, text, offset - 1);
	},
	enter(this: Note, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		if (!range.collapsed) return console.warn("TODO: split when selection is a range.");
		let point = {
			node: range.startContainer,
			offset: range.startOffset
		}
		let item = items.getItem(range);
		if (!item) return console.warn("Not on item for split");
		range.selectNodeContents(item);
		if (!this.owner.markup(range)) {
			//TODO this warning probably won't ever appear due to having ws text in the item.
			return console.warn("Nothing to split - empty item.");
		}
		range.setEnd(point.node, point.offset);
		if (!this.owner.markup(range)) {

			//For some reason, the selection range gets whacked.
			this.owner.frame.selectionRange = this.insert(range);
			return;
		}

		range.selectNodeContents(item);
		range.setStart(point.node, point.offset);
		this.split(range);
		range.selectNodeContents(text.firstText(item.nextElementSibling));
		range.collapse(true);

	},
	promote(this: Note, event: UserEvent) {
		event.subject = "";
		this.level("Promote", event.range);
	},
	demote(this: Note, event: UserEvent) {
		event.subject = "";
		this.level("Demote", event.range);
	},
	tag(this: Note, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		let tagName = tag[event.key] || "SPAN";
		let content = this.owner.markup(range) || "&nbsp;";
		this.edit("Tag", range, `<p><${tagName}>${content}</${tagName}></p>`);
		let node = range.startContainer.childNodes[range.startOffset];
		range.selectNodeContents(node.firstChild);
		range.collapse();
	}
});


