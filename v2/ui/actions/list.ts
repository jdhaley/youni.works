import { Box } from "../../base/control";
import { ELE, RANGE } from "../../base/dom";
import { extend } from "../../base/util.js";

import { EditEvent, UserEvent } from "../../control/frame.js";
import { getFooter, getHeader } from "../util.js";
import editable from "./editor.js";

export default extend(editable, {
	dblclick(this: Box<ELE>, event: UserEvent) {
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
	insertText(this: Box<ELE>, event: EditEvent) {
		if (getFooter(this, event.range.commonAncestorContainer)) {
			event.subject = "";
			let model = {
				"title": event.data,
				"type$": "task"
			}
			event.range.selectNodeContents(this.content.view);
			event.range.collapse();
			this.exec("Insert", event.range, [model]);
			goToTask(event.on, this.type.owner.frame.selectionRange as RANGE);
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