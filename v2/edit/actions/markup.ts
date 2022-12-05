import { Editor } from "../../base/editor.js";
import { ele, NODE, RANGE } from "../../base/dom.js";
import { extend } from "../../base/util.js";

import { EditEvent, UserEvent } from "../../control/frame.js";
import { getClipboard } from "../../control/clipboard.js";

import editor from "./editor.js";

export default extend(editor, {
	paste(this: Editor, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		let model = getClipboard(event.clipboardData);
		this.exec("Paste", range, model);
	},
	insertText(this: Editor, event: EditEvent) {
		event.subject = "";
		let model = {
			"type$": "para",
			"content": event.data
		};
		this.exec("Entry", event.range, [model]);
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
		this.exec("Split", range, model);
		range = this.type.context.selectionRange as RANGE;
		//If split happened at the start of the paragraph
		//leave the caret there (on the empty paragraph).
		if (range && !range.startContainer.textContent) {
			range.selectNodeContents(range.startContainer);
			range.collapse();
		}
	},
	join(this: Editor, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		this.exec("Join", range, "");
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
		range.setStartBefore(current.view);
		range.collapse(true);
		this.exec("Insert", range, [item]);
	},
	demote(this: Editor, event: UserEvent) {
		event.subject = "";
		this.exec("Demote", event.range);
	},
	promote(this: Editor, event: UserEvent) {
		event.subject = "";
		this.exec("Promote", event.range);
	}
});

export function getChildEditor(editor: Editor, node: NODE): Editor {
	if (node == editor.content) return null;
	while (node?.parentNode != editor.content) {
		node = node.parentNode;
	}
	if (ele(node) && node["$control"]) return node["$control"] as Editor;
}

// function createItem(refNode: Editor): item {
// 	let item: item;
// 	if (!(refNode instanceof RowEditor)) {
// 		refNode = getView(refNode.node.previousElementSibling);
// 	}
// 	if (refNode instanceof RowEditor) {
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

// function nav(event: UserEvent, isPrevious?: boolean) {
// 	let item = navigate(event.range, isPrevious);
// 	if (item) {
// 		event.range.selectNodeContents(item);
// 		item.scrollIntoView({block: "center"});
// 	}
// }
