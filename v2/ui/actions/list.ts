import { Box } from "../../base/display.js";
import { ELE, RANGE } from "../../base/dom.js";
import { extend } from "../../base/util.js";

import { UserEvent } from "../../control/frame.js";
import { getHeader } from "../util.js";
import editable from "../../edit/actions/editor.js";

export default extend(editable, {
	dblclick(this: Box, event: UserEvent) {
		let header = getHeader(this, event.target as Node);
		if (header) {
			event.subject = "";
			if (this.view.classList.contains("collapsed")) {
				this.view.classList.remove("collapsed");
			} else {
				this.view.classList.add("collapsed");
			}
		}
	},
	// TODO this should be redeveloped.

	// insertText(this: Box, event: EditEvent) {
	// 	if (getFooter(this, event.range.commonAncestorContainer)) {
	// 		event.subject = "";
	// 		let model = {
	// 			"title": event.data,
	// 			"type$": "task"
	// 		}
	// 		event.range.selectNodeContents(this.content);
	// 		event.range.collapse();
	// 		this.exec("Insert", event.range, [model]);
	// 		//goToTask(event.on, this.type.context.selectionRange as RANGE);
	// 	}
	// }
});

function goToTask(view: ELE, range: RANGE) {
	// let go = getContent(view).lastElementChild;
	// go = getContent(go).firstElementChild;
	// go = getContent(go);
	// range.setStart(go.firstChild, go.firstChild.textContent.length);
	// range.collapse(true);
}