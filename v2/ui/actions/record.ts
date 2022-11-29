import { extend } from "../../base/util.js";
import { RecordBox } from "../controls/record.js";
import { UserEvent } from "../../control/frame";
import editable from "./editor.js";

import { getHeader } from "../util.js";

export default extend(editable, {
	dblclick(this: RecordBox, event: UserEvent) {
		event.subject = "";
		if (event.target == this.header) {
			event.subject = "";
			if (this.kind.contains("collapsed")) {
				this.header.view.textContent = this.type.conf.title;
				this.kind.remove("collapsed");
			} else {
				let title = this.get("title").content.textContent || "";
				this.header.view.innerHTML += ": " + `<b>${title}</b>`;
				this.kind.add("collapsed");
			}
		}
	},
	click(this: RecordBox, event: UserEvent) {
		event.subject = "";
		if (event.altKey && getHeader(this, event.target as Node)) {
			let range = event.on.ownerDocument.createRange();
			range.selectNode(event.on);
			event.frame.selectionRange = range;
		}
	},
});