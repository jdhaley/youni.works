import {extend} from "../../base/util.js";
import {EditEvent, UserEvent} from "../ui.js";
import {getContent, navigate} from "../editor/util.js";
import list from "./list.js";
import { getClipboard } from "../clipboard.js";
import { content } from "../../base/model.js";
import { EditableView } from "../../base/editor";

export default extend(list, {
	paste(this: EditableView, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		let model = getClipboard(event.clipboardData);
		range = this.edit("Paste", range, model);
		range &&  this.type.owner.setRange(range, true);
	},
	insertText(this: EditableView, event: EditEvent) {
		event.subject = "";
		let model = {
			"type$": "para",
			"content": event.data
		};
		let range = this.edit("Entry", event.range, [model]);
		range &&  this.type.owner.setRange(range, true);
	},
	split(this: EditableView, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		let model: content = "";
		if (!range.collapsed) {
			//This model will supress the merging of the first and last line.
			model = [{
				"type$": "para",
				"content": ""
			}, {
				"type$": "para",
				"content": ""
			}];	
		}
		range = this.edit("Split", range, model);
		//If split happened at the start of the paragraph
		//leave the caret there (on the empty paragraph).
		if (range && !range.startContainer.textContent) {
			range.selectNodeContents(range.startContainer);
			range.collapse();
		}
		range && this.type.owner.setRange(range, true);
	},
	join(this: EditableView, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		range = this.edit("Join", range, "");
		range && this.type.owner.setRange(range, true);
	},
	next(this: EditableView, event: UserEvent) {
		event.subject = "";
		if (event.altKey) {
			nav(event);
		} else {
			this.edit("Demote", event.range);
		}
	},
	previous(this: EditableView, event: UserEvent) {
		event.subject = "";
		if (event.altKey) {
			nav(event, true);
		} else {
			this.edit("Promote", event.range);
		}
	}
});

function nav(event: UserEvent, isPrevious?: boolean) {
	let item = navigate(event.on, isPrevious);
	if (item) {
		event.range.selectNodeContents(item);
		item.scrollIntoView({block: "center"});
	}
}

function goToTask(view: Element, range: Range) {
	let go = getContent(view).lastElementChild;
	go = getContent(go).firstElementChild;
	go = getContent(go);
	range.setStart(go.firstChild, go.firstChild.textContent.length);
	range.collapse(true);
}