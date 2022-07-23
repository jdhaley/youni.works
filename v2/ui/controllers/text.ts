import {getHeader, getView, getViewContent} from "../display.js";
import {CHAR, extend} from "../../base/util.js";
import {UserEvent} from "../ui.js";
import {Editor} from "../article.js";

import view from "./view.js";

export default extend(view, {
	paste(this: Editor, event: UserEvent) {
		event.subject = "";
		let text = event.clipboardData.getData("text/plain");
		if (!text) return; //Don't proceed & clear the range when there is nothing to paste.
		let range = event.frame.selectionRange;
		positionToText(range);
		this.edit("Paste", range, text);	
	},
	charpress(this: Editor, event: UserEvent) {
		event.subject = "";
		let char = event.key;
		let range = this.owner.frame.selectionRange;
		positionToText(range);
		if (range.collapsed) {
			let content = getViewContent(event.on);	
			if (content.textContent == CHAR.ZWSP) content.textContent = "";
			if (char == " " && range.endOffset == content.textContent.length) {
				char = CHAR.NBSP;
			}
		}
		this.edit("Entry", range, char);
		console.log(this.owner.frame.selectionRange.commonAncestorContainer);
	},
	erase(this: Editor, event: UserEvent) {
		event.subject = ""
		let range = this.owner.frame.selectionRange;
		positionToText(range);
		if (range.collapsed && !range.startOffset) return;
		this.edit("Erase", range, "");
	},
	delete(this: Editor, event: UserEvent) {
		event.subject = ""
		let range = this.owner.frame.selectionRange;
		positionToText(range);
		if (range.collapsed && range.startOffset == range.startContainer.textContent.length) return;
		this.edit("Delete", range, "");
	}
});
function inView(range: Range) {
	// if (range.commonAncestorContainer.nodeType != Node.TEXT_NODE) {
	// 	let view = getView(range);
	// 	if (view.v_content.childNodes.length != 1) {
	// 		//force single text node...
	// 		view.v_content.textContent = view.v_content.textContent;
	// 		range.selectNodeContents(view.v_content);
	// 		range.collapse();
	// 	}
	// }
	let node = range.commonAncestorContainer;
	return node == view.v_content || node.parentElement == view.v_content ? true : false;
}
function positionToText(range: Range) {
	let view = getView(range);
	let ctx = range.commonAncestorContainer;
	let inHeader = getHeader(view, ctx);
	if (inHeader) {
		range.setStart(view.v_content, 0);
	}
	if (range.collapsed) {
		if (view.v_content.childNodes.length != 1) {
			//force single text node...
			view.v_content.textContent = view.v_content.textContent;
		}
		if (ctx.nodeType != Node.TEXT_NODE) {
			range.selectNodeContents(view.v_content.lastChild);
			range.collapse(inHeader ? true : false);	
		}
	}
}
