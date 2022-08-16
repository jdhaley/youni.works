import { UserEvent } from "../../../ui/ui";
import { RangeCommands } from "./editor";

export {UserEvent, Article, text, Display}
class Article {
	model: any;
	dataset: any;
	send: any;
	view: any;
	setEditable: any;
	owner: any;
	transform: any;
	
}
type Display = any;

export class Note extends Article {
	declare commands: RangeCommands;
	navigateToText(range: Range, bf: string): Range {
		return null;
	}
}

const text = {
	priorText(node: Node) {
		let parent = node.parentNode;
		for (node = node.previousSibling; node; node = node.previousSibling) {
			if (node.nodeType == Node.TEXT_NODE) return node;
			if (node.nodeType == Node.ELEMENT_NODE) {
				let text = this.lastText(node);
				if (text) return text;
			}
		}
		return parent ? this.priorText(parent) : null;
	},
	nextText(node: Node) {
		let parent = node.parentNode;
		for (node = node.nextSibling; node; node = node.nextSibling) {
			if (node.nodeType == node.TEXT_NODE) return node;
			if (node.nodeType == Node.ELEMENT_NODE) {
				let text = this.firstText(node);
				if (text) return text;
			}
		}
		return parent ? this.nextText(parent) : null;
	},
	firstText(node: Node) {
		for (node = node.firstChild; node; node = node.nextSibling) {
			if (node.nodeType == node.TEXT_NODE) return node;
			if (node.nodeType == Node.ELEMENT_NODE) {
				let text = this.firstText(node);
				if (text) return text;
			}
		}
	},
	lastText(node: Node) {
		for (node = node.lastChild; node; node = node.previousSibling) {
			if (node.nodeType == node.TEXT_NODE) return node;
			if (node.nodeType == Node.ELEMENT_NODE) {
				let text = this.lastText(node);
				if (text) return text;
			}
		}
	}
}
