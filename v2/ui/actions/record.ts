import { extend } from "../../base/util.js";
import { RecordBox } from "../controls/record.js";
import { UserEvent } from "../frame";
import editable from "./editor.js";

import { getHeader } from "../util.js";

export default extend(editable, {
	dblclick(this: RecordBox, event: UserEvent) {
		event.subject = "";
		if (event.target == this.header) {
			event.subject = "";
			if (this.styles.contains("collapsed")) {
				this.header.textContent = this._type.conf.title;
				this.styles.remove("collapsed");
			} else {
				let title = this.get("title").content.textContent || "";
				this.header.innerHTML += ": " + `<b>${title}</b>`;
				this.styles.add("collapsed");
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