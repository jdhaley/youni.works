import {getView} from "../display.js";
import {extend} from "../../base/util.js";
import {UserEvent} from "../ui.js";
import {Editor} from "../article.js";

import view from "./view.js";

export default extend(view, {
	paste(this: Editor, event: UserEvent) {
		event.subject = "";
		let range = event.frame.selectionRange;
		//TODO Q: should paste [cut] happen when there is no clipboard data?
		if (!inView(range)) return;

		let text = event.clipboardData.getData("text/plain");
		this.edit("Paste", range, text);	
	},
	charpress(this: Editor, event: UserEvent) {
		event.subject = ""
		let range = this.owner.frame.selectionRange;
		if (!inView(range)) return;

		this.edit("Entry", range, event.key);
	},
	erase(this: Editor, event: UserEvent) {
		event.subject = ""
		let range = this.owner.frame.selectionRange;
		if (inView(range)) {
			if (range.collapsed && !range.startOffset) {
			} else {
				this.edit("Erase", range, "");
			}
		}
	},
	delete(this: Editor, event: UserEvent) {
		event.subject = ""
		let range = this.owner.frame.selectionRange;
		if (inView(range)) {
			if (range.collapsed && range.startOffset == range.startContainer.textContent.length) {
			} else {
				this.edit("Delete", range, "");
			}
		}
	}
});
function inView(range: Range) {
	let node = range.commonAncestorContainer;
	let view = getView(node);
	return node.parentElement == view.v_content ? true : false;
}
