import { ele, NODE } from "../../base/dom.js";
import { extend } from "../../base/util.js";

import { Viewbox as Box } from "../box.js";
import { EditEvent, UserEvent } from "../frame.js";
import { navigate, getClipboard } from "../util.js";

import list from "./list.js";

export default extend(list, {
	paste(this: Box, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		let model = getClipboard(event.clipboardData);
		range = this.exec("Paste", range, model);
		range &&  this.type.owner.setExtent(range, true);
	},
	insertText(this: Box, event: EditEvent) {
		event.subject = "";
		let model = {
			"type$": "para",
			"content": event.data
		};
		let range = this.exec("Entry", event.range, [model]);
		range &&  this.type.owner.setExtent(range, true);
	},
	split(this: Box, event: UserEvent) {
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
		range = this.exec("Split", range, model);
		//If split happened at the start of the paragraph
		//leave the caret there (on the empty paragraph).
		if (range && !range.startContainer.textContent) {
			range.selectNodeContents(range.startContainer);
			range.collapse();
		}
		range && this.type.owner.setExtent(range, true);
	},
	join(this: Box, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		range = this.exec("Join", range, "");
		range && this.type.owner.setExtent(range, true);
	},
	next(this: Box, event: UserEvent) {
		event.subject = "";
		if (event.altKey || event.ctrlKey) {
			nav(event);
		} else {
			this.exec("Demote", event.range);
		}
	},
	previous(this: Box, event: UserEvent) {
		event.subject = "";
		if (event.altKey || event.ctrlKey) {
			nav(event, true);
		} else {
			this.exec("Promote", event.range);
		}
	},
	insert(this: Box, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		if (!range.collapsed) return;
		let current = getChildBox(this, range.commonAncestorContainer);
		if (!current) return;
		//let item = createItem(current);
		let item = {
			type$: "worktask"
		}
		range.setStartBefore(current.view);
		range.collapse(true);
		this.exec("Insert", range, [item]);
	}
});

export function getChildBox(editor: Box, node: NODE): Box {
	if (node == editor.content.view) return null;
	while (node?.parentNode != editor.content.view) {
		node = node.parentNode;
	}
	if (ele(node) && node["$control"]) return node["$control"] as Box;
}

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
