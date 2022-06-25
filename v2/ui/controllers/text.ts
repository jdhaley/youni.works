import {UserEvent} from "../ui.js";
import {extend} from "../../base/util.js";
import {ViewType} from "../../base/view.js";
import view from "./view.js";

export default extend(view, {
	// cut(this: Article, event: UserEvent) {
	// 	event.subject = "";
	// 	let range = this.owner.selectionRange;
	// 	if (range.collapsed) return;
	// 	range = adjustRange(range, getElement(range, "list"));
	// 	event.clipboardData.setData("text/json", JSON.stringify(this.toModel(range)));
	// 	range = this.edit("Cut", range, "");
	// 	range.collapse();
	// },
	// paste(this: Article, event: UserEvent) {
	// 	event.subject = "";
	// 	let range = this.owner.selectionRange;
	// 	let data = event.clipboardData.getData("text/json");
	// 	console.log(data);
	// 	let model = JSON.parse(data);
	// 	let view = this.type.toView(model, this.view);
	// 	range = this.edit("Paste", range, view.innerHTML);
	// 	range.collapse();
	// },
	charpress(this: ViewType, event: UserEvent) {
		event.subject = "user_edit";
		// event.subject = ""
		// let range = this.owner.selectionRange;
		// let node = range.commonAncestorContainer;
		// if (node.nodeType != Node.TEXT_NODE) return;

		// let offset = range.startOffset;
		// let text = range.commonAncestorContainer.textContent;
		// text = text.substring(0, offset) + event.key + text.substring(offset);
		// this.textEdit("Enter-Text", range, text, offset + 1);
	},
	delete(this: ViewType, event: UserEvent) {
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
	erase(this: ViewType, event: UserEvent) {
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
	enter(this: ViewType, event: UserEvent) {
		// event.subject = "";
	},
});
