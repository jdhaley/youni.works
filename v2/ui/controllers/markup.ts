import { Editor } from "../../base/editor.js";
import { extend } from "../../base/util.js";

import { navigate } from "../../display/view.js";

import { EditEvent, UserEvent, getClipboard } from "../ui.js";

import list from "./list.js";

import { getChildEditor } from "../../edit/util.js";

export default extend(list, {
	paste(this: Editor, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		let model = getClipboard(event.clipboardData);
		range = this.edit("Paste", range, model);
		range &&  this.owner.setRange(range, true);
	},
	insertText(this: Editor, event: EditEvent) {
		event.subject = "";
		let model = {
			"type$": "para",
			"content": event.data
		};
		let range = this.edit("Entry", event.range, [model]);
		range &&  this.owner.setRange(range, true);
	},
	split(this: Editor, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		let model = null;
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
		range && this.owner.setRange(range, true);
	},
	join(this: Editor, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		range = this.edit("Join", range, "");
		range && this.owner.setRange(range, true);
	},
	next(this: Editor, event: UserEvent) {
		event.subject = "";
		if (event.altKey || event.ctrlKey) {
			nav(event);
		} else {
			this.edit("Demote", event.range);
		}
	},
	previous(this: Editor, event: UserEvent) {
		event.subject = "";
		if (event.altKey || event.ctrlKey) {
			nav(event, true);
		} else {
			this.edit("Promote", event.range);
		}
	},
	insert(this: Editor, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		if (!range.collapsed) return;
		let current = getChildEditor(this, range.commonAncestorContainer);
		if (!current) return;
		//let item = createItem(current);
		let item = {
			type$: "worktask"
		}
		range.setStartBefore(current.node);
		range.collapse(true);
		this.edit("Insert", range, [item]);
	}
});

// function createItem(refNode: Editor): item {
// 	let item: item;
// 	if (!(refNode instanceof RowBox)) {
// 		refNode = getView(refNode.node.previousElementSibling);
// 	}
// 	if (refNode instanceof RowBox) {
// 		item = {
// 			type$: "row",
// 			columns: refNode.columns,
// 			content: {}
// 		};
// 		for (let name in refNode.type.types) {
// 			item.content[name] = "";
// 		}
// 	} else {
// 		item = {
// 			type$: "row",
// 			content: {
// 				"Key": "Key",
// 				"Value": "Value"
// 			},
// 			columns: ["Key", "Value"]
// 		}
// 	}
// 	return item;
// }

function nav(event: UserEvent, isPrevious?: boolean) {
	let item = navigate(event.range, isPrevious);
	if (item) {
		event.range.selectNodeContents(item);
		item.scrollIntoView({block: "center"});
	}
}
