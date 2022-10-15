import {extend} from "../../base/util.js";
import {EditEvent, UserEvent} from "../ui.js";
import {getFooter, getHeader} from "../../edit/util.js";
import editable from "./editor.js";
import { Editor } from "../../base/editor.js";
import { ELE, RANGE } from "../../base/dom";

export default extend(editable, {
	dblclick(event: UserEvent) {
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
	insertText(this: Editor, event: EditEvent) {
		if (getFooter(event.on, event.range.commonAncestorContainer)) {
			event.subject = "";
			let model = {
				"title": event.data,
				"type$": "task"
			}
			event.range.selectNodeContents(this.contentNode);
			event.range.collapse();
			let range = this.edit("Insert", event.range, [model]);
			goToTask(event.on, range);
		}
	}
});

function goToTask(view: ELE, range: RANGE) {
	// let go = getContent(view).lastElementChild;
	// go = getContent(go).firstElementChild;
	// go = getContent(go);
	// range.setStart(go.firstChild, go.firstChild.textContent.length);
	// range.collapse(true);
}