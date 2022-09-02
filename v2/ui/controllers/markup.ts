import {CHAR, extend} from "../../base/util.js";
import {EditEvent, UserEvent} from "../ui.js";
import {Editor} from "../editor/editor.js";
import {getContent, getFooter, getHeader, rangeIterator} from "../editor/util.js";
import list from "./list.js";
import { getClipboard } from "../clipboard.js";

export default extend(list, {
	paste(this: Editor, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		let model = getClipboard(event.clipboardData);
		range = this.edit("Paste", range, model);
		range &&  this.owner.setRange(range, true);
	},
	insertText(this: Editor, event: EditEvent) {
		if (getFooter(event.on, event.range.commonAncestorContainer)) {
			event.subject = "";
			let model = {
				"type$": "para",
				"content": event.data
			}
			event.range.selectNodeContents(getContent(event.on));
			event.range.collapse();
			let range = this.edit("Insert", event.range, [model]);
			goToTask(event.on, range);
		}
	},
	split(this: Editor, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		range = this.edit("Split", range, "");
		range && this.owner.setRange(range, true);
	}
});

function goToTask(view: Element, range: Range) {
	let go = getContent(view).lastElementChild;
	go = getContent(go).firstElementChild;
	go = getContent(go);
	range.setStart(go.firstChild, go.firstChild.textContent.length);
	range.collapse(true);
}