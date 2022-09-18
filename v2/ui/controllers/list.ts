import {CHAR, extend} from "../../base/util.js";
import {EditEvent, UserEvent} from "../ui.js";
import {EditableView, Editor} from "../editor/editor.js";
import {getContent, getFooter, getHeader, rangeIterator} from "../editor/util.js";
import editable from "./editable.js";

export default extend(editable, {
	click(event: UserEvent) {
		let view = event.on;
		let header = getHeader(event.on, event.target as Node);
		if (header) {
			event.subject = "";
			if (view.classList.contains("collapsed")) {
				view.classList.remove("collapsed");
			} else {
				view.classList.add("collapsed");
			}
		}
	},
	insertText(this: EditableView, event: EditEvent) {
		if (getFooter(event.on, event.range.commonAncestorContainer)) {
			event.subject = "";
			let model = {
				"title": event.data,
				"type$": "task"
			}
			event.range.selectNodeContents(getContent(event.on));
			event.range.collapse();
			let range = this.edit("Insert", event.range, [model]);
			goToTask(event.on, range);
		}
	}
});

function goToTask(view: Element, range: Range) {
	let go = getContent(view).lastElementChild;
	go = getContent(go).firstElementChild;
	go = getContent(go);
	range.setStart(go.firstChild, go.firstChild.textContent.length);
	range.collapse(true);
}