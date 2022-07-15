import {UserEvent} from "../ui.js";
import {extend} from "../../base/util.js";
import view from "./view.js";
import {Edit, EditType, mark, unmark} from "../editor/edit.js";
import { getView } from "../../base/display.js";

let TEXT_EDIT = {
	node: null,
	start: 0,
	end: 0
}
export default extend(view, {
	paste(this: EditType, event: UserEvent) {
		event.subject = "";
		let range = event.frame.selectionRange;
		let text = event.clipboardData.getData("text/plain");
		this.edit("Paste", range, text);
	},
	charpress(this: EditType, event: UserEvent) {
		event.subject = ""
		let range = this.owner.frame.selectionRange;
		let node = range.commonAncestorContainer;
		if (node.parentElement.classList.contains("view")) {
			if (range.collapsed && node == TEXT_EDIT.node) {
				let offset = range.startOffset;
				if (offset == TEXT_EDIT.end) {	
					let view = getView(range);
					let cmd = this.owner.commands.peek() as Edit;
					if (view?.id == cmd?.viewId) {
						let text = node.textContent;
						text = text.substring(0, offset) + event.key + text.substring(offset);
						node.textContent = text;
						range.setStart(node, TEXT_EDIT.start);
						range.setEnd(node, offset + 1);
						TEXT_EDIT.end++;
						mark(range);
						console.log(TEXT_EDIT.start, TEXT_EDIT.end, node.parentElement.innerHTML);

						cmd.after = view.innerHTML;
						unmark(range);
						range.collapse();
						return;
					}
				}
			}
			TEXT_EDIT.node = null;
			if (range.collapsed) {
				TEXT_EDIT.node = node;
				TEXT_EDIT.start = range.startOffset;
				TEXT_EDIT.end = range.endOffset + 1;
			}
			this.edit("Replace", range, event.key);
			range.collapse();
			
			// let offset = range.startOffset;
			// this.textEdit("Enter-Text", range, text, offset + 1);	
		}
	},
	delete(this: EditType, event: UserEvent) {
		event.subject = "user_edit";
		// event.subject = "";
		// let range = this.owner.selectionRange;
		// if (!range.collapsed) {
		// 	range = adjustRange(range, getElement(range, "list"));
		// 	range = this.edit("Delete", range, "");
		// 	range.collapse();
		// 	return;
		// } 
		// let node = range.commonAncestorContainer;
		// if (node.nodeType != Node.TEXT_NODE) return;
		// let offset = range.startOffset;
		// let text = range.commonAncestorContainer.textContent;
		// if (offset >= text.length) return;
		// text = text.substring(0, offset) + text.substring(offset + 1);
		// this.textEdit("Delete-Text", range, text, offset);
	},
	erase(this: EditType, event: UserEvent) {
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
