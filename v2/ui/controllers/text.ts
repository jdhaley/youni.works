import {getView} from "../../base/display.js";
import {extend} from "../../base/util.js";
import {UserEvent} from "../ui.js";
import {EditType} from "../editor/edit.js";

import view from "./view.js";

export default extend(view, {
	paste(this: EditType, event: UserEvent) {
		event.subject = "";
		let range = event.frame.selectionRange;
		//TODO Q: should paste [cut] happen when there is no clipboard data?
		if (!inView(range)) return;

		let text = event.clipboardData.getData("text/plain");
		this.edit("Paste", range, text);	
	},
	charpress(this: EditType, event: UserEvent) {
		event.subject = ""
		let range = this.owner.frame.selectionRange;
		if (!inView(range)) return;

		this.edit("Entry", range, event.key);
	},
	erase(this: EditType, event: UserEvent) {
		event.subject = ""
		let range = this.owner.frame.selectionRange;
		if (!inView(range)) return;

		this.edit("Erase", range, "");
	},
	delete(this: EditType, event: UserEvent) {
		event.subject = "user_edit";
		// event.subject = "";
		// let range = this.owner.selectionRange;
		// if (!range.collapsed) {
		// 	this.edit("Delete", range, "");
		// 	return;
		// } 
		// let node = range.commonAncestorContainer;
		// if (node.nodeType != Node.TEXT_NODE) return;
		// let offset = range.startOffset;
		// let text = range.commonAncestorContainer.textContent;
		// if (offset < 1) return;
		// text = text.substring(0, offset - 1) + text.substring(offset);
		// this.textEdit("Erase-Text", range, text, offset - 1);
	},
	enter(this: EditType, event: UserEvent) {
		// event.subject = "";
	},
});
function inView(range: Range) {
	let node = range.commonAncestorContainer;
	let view = getView(node);
	return node.parentElement == view.v_content ? true : false;
}
