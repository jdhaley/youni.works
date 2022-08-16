import {extend} from "../../base/util.js";
import {Frame, UserEvent} from "../ui.js"

import {RangeCommands} from "../../devt/note/items/editor.js";
import items from "../../devt/note/items/items.js";
import text from "../../devt/note/items/text.js";

import baseController from "./editable.js";

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

interface NoteOwner {
	frame: Frame;
	commands: RangeCommands;
	document: Document;
	selectionRange: Range;
	markup(x: string | Range): string;
}
interface Note {
	owner: NoteOwner;
	transform: any;
	navigateToText(range: Range, bf: string): Range;
}

const tag = {
	"b": "STRONG",
	"i": "EM",
	"u": "CITE"
}

export default extend(baseController, {
	cut(this: Note, event: UserEvent) {
		event.subject = "";
		let range = this.owner.selectionRange;
		if (range.collapsed) return;
		let source = this.owner.document.createElement("DIV");
		source.innerHTML = this.owner.markup(range);
		let target = this.transform.fromView(source) as HTMLElement;

		this.owner.commands.replace("Cut", range, "");
		event.clipboardData.setData("text/html", target.innerHTML);
		event.clipboardData.setData("text/plain", items.toTextLines(range));
	},
	copy(this: Note, event: UserEvent) {
		event.subject = "";
		let range = this.owner.selectionRange;
		let source = this.owner.document.createElement("DIV");
		source.innerHTML = this.owner.markup(range);
		let target = this.transform.fromView(source) as HTMLElement;
		event.clipboardData.setData("text/html", target.innerHTML);
		event.clipboardData.setData("text/plain", items.toTextLines(range));
	},
	paste(this: Note, event: UserEvent) {
		event.subject = "";
		let range = this.owner.selectionRange;
		let data = event.clipboardData.getData("text/html");
		if (data) {
			let source = this.owner.document.createElement("DIV");
			source.innerHTML = data;
			data = this.transform.toView(source).innerHTML;
		} else {
			data = event.clipboardData.getData("text/plain");
			if (!data) return console.warn("no data to paste");	
			if (data.indexOf("\n")) {
				data = items.itemsFromText(this.owner.document, data).innerHTML;
			}
		}
		this.owner.commands.replace("Paste", range, data);
		range.collapse();
	},
	charpress(this: Note, event: UserEvent) {
		event.subject = "";
		let range = this.owner.selectionRange;
		if (!range.collapsed) {
			/* TODO The range's start after the replace is from
				the start of the item (or text node) - not the actual selected range.
				This i think is a limitation of the replace algo.  There's not much harm here
				particularly when we collapse the range.
			*/
			this.owner.commands.replace("Replace", range, `<P>${event.key}</P>`);
			range.collapse();
			return;
		}
		let node = range.commonAncestorContainer;
		if (node.nodeType != Node.TEXT_NODE) {
			let to = this.navigateToText(range, "next");
			if (!to) to = this.navigateToText(range, "prior");
			if (to) {
				range = to;
			} else {
				range.selectNodeContents(items.getItems(range));
				range.collapse(true);
				let value = event.key == " " ? "\xa0" : event.key;
				this.owner.commands.replace("Insert", range, "<P>" + value + "</P>");
				to = range;
			}
		}

		let offset = range.startOffset;
		let text = range.commonAncestorContainer.textContent;
		text = text.substring(0, offset) + event.key + text.substring(offset);
		this.owner.commands.edit("Enter-Text", range, text, offset + 1);
	},
	delete(this: Note, event: UserEvent) {
		event.subject = "";
		let range = this.owner.selectionRange;
		if (!range.collapsed) {
			this.owner.commands.replace("Delete", range, "");
			return;
		} 
		let node = range.commonAncestorContainer;
		if (node.nodeType != Node.TEXT_NODE || range.startOffset >= node.textContent.length) {
			range = this.navigateToText(range, "next");
			if (!range) return console.warn("cant navigate to text node.");
		}
		if (items.getItem(range.commonAncestorContainer) != items.getItem(node)) {
			range.setStartAfter(items.getItem(node).lastChild);
			this.owner.commands.replace("Join", range, "");
			return;
		}

		let offset = range.startOffset;
		let text = range.commonAncestorContainer.textContent;
		if (offset >= text.length) return;
		text = text.substring(0, offset) + text.substring(offset + 1);
		this.owner.commands.edit("Delete-Text", range, text, offset);
	},
	erase(this: Note, event: UserEvent) {
		event.subject = "";
		let range = this.owner.selectionRange;
		if (!range.collapsed) {
			this.owner.commands.replace("Delete", range, "");
			return;
		}
		let node = range.commonAncestorContainer;
		if (node.nodeType != Node.TEXT_NODE || range.startOffset == 0) {
			range = this.navigateToText(range, "prior");
			if (!range) return console.warn("cant navigate to text node.");
		}
		if (items.getItem(range.commonAncestorContainer) != items.getItem(node)) {
			range.setEndBefore(items.getItem(node).firstChild);
			this.owner.commands.replace("Join", range, "");
			return;
		}
		let offset = range.startOffset;
		let text = range.commonAncestorContainer.textContent;
		if (offset < 1) return;
		text = text.substring(0, offset - 1) + text.substring(offset);
		this.owner.commands.edit("Erase-Text", range, text, offset - 1);
	},
	enter(this: Note, event: UserEvent) {
		event.subject = "";
		let range = this.owner.selectionRange;
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
			this.owner.selectionRange = this.owner.commands.insert(range);
			return;
		}

		range.selectNodeContents(item);
		range.setStart(point.node, point.offset);
		this.owner.commands.split(range);
		range.selectNodeContents(text.firstText(item.nextElementSibling));
		range.collapse(true);

	},
	promote(this: Note, event: UserEvent) {
		event.subject = "";
		this.owner.commands.level("Promote", this.owner.selectionRange);
	},
	demote(this: Note, event: UserEvent) {
		event.subject = "";
		this.owner.commands.level("Demote", this.owner.selectionRange);
	},
	tag(this: Note, event: UserEvent) {
		event.subject = "";
		let range = this.owner.selectionRange;
		let tagName = tag[event.key] || "SPAN";
		let content = this.owner.markup(range) || "&nbsp;";
		this.owner.commands.replace("Tag", range, `<p><${tagName}>${content}</${tagName}></p>`);
		let node = range.startContainer.childNodes[range.startOffset];
		range.selectNodeContents(node.firstChild);
		range.collapse();
	}
});


