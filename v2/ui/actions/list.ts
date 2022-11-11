import { ELE, RANGE } from "../../base/dom";
import { extend } from "../../base/util.js";

import { Box } from "../box.js";
import { EditEvent, UserEvent } from "../frame.js";
import { getFooter, getHeader } from "../util.js";
import editable from "./editor.js";

export default extend(editable, {
	dblclick(this: Box, event: UserEvent) {
		let header = getHeader(this, event.target as Node);
		if (header) {
			event.subject = "";
			if (this.kind.contains("collapsed")) {
				this.kind.remove("collapsed");
			} else {
				this.kind.add("collapsed");
			}
		}
	},
	insertText(this: Box, event: EditEvent) {
		if (getFooter(this, event.range.commonAncestorContainer)) {
			event.subject = "";
			let model = {
				"title": event.data,
				"type$": "task"
			}
			event.range.selectNodeContents(this.content.view);
			event.range.collapse();
			let range = this.exec("Insert", event.range, [model]);
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