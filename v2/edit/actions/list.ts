import {extend} from "../../base/util.js";
import {EditEvent, UserEvent} from "../../ui/ui.js";
import {getFooter, getHeader} from "../../display/util.js";
import editable from "./editor.js";
import { Editor } from "../editor.js";
import { ELE, RANGE } from "../../base/dom";
import { ElementView } from "../../display/view.js";

export default extend(editable, {
	dblclick(this: ElementView, event: UserEvent) {
		let header = getHeader(this, event.target as Node);
		if (header) {
			event.subject = "";
			if (this.styles.contains("collapsed")) {
				this.styles.remove("collapsed");
			} else {
				this.styles.add("collapsed");
			}
		}
	},
	insertText(this: ElementView, event: EditEvent) {
		if (getFooter(this, event.range.commonAncestorContainer)) {
			event.subject = "";
			let model = {
				"title": event.data,
				"type$": "task"
			}
			event.range.selectNodeContents(this.content.node);
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