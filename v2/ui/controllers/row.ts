import { extend } from "../../base/util.js";
import { RecordEditor } from "../../editor/controls/record.js";
import { getHeader } from "../../editor/util.js";
import { UserEvent } from "../ui.js";
import editable from "./editor.js";

export default extend(editable, {
	dblclick(this: RecordEditor, event: UserEvent) {
		event.subject = "";
		if (event.target == this.header) {
			event.subject = "";
			if (this.node.classList.contains("collapsed")) {
				this.header.textContent = this.type.conf.title;
				this.node.classList.remove("collapsed");
			} else {
				let title = this.at.title.content.textContent || "";
				this.header.innerHTML += ": " + `<b>${title}</b>`;
				this.node.classList.add("collapsed");
			}
		}
	},
	click(event: UserEvent) {
		event.subject = "";
		if (event.altKey && getHeader(event.on, event.target as Node)) {
			let range = event.on.ownerDocument.createRange();
			range.selectNode(event.on);
			event.frame.selectionRange = range;
		}
	},
});