import { extend } from "../../base/util.js";
import { UserEvent } from "../frame";
import editable from "./edit/editor.js";

import { getHeader } from "../uiUtil.js";
import { Box } from "../../control/box.js";

export default extend(editable, {
	dblclick(this: Box, event: UserEvent) {
		event.subject = "";
		if (event.target == this.header.view) {
			event.subject = "";
			if (this.view.classList.contains("collapsed")) {
				this.header.view.textContent = this.type.title;
				this.view.classList.remove("collapsed");
			} else {
				let title = (this.get("title") as Box).body.view.textContent || "";
				this.header.view.innerHTML += ": " + `<b>${title}</b>`;
				this.view.classList.add("collapsed");
			}
		}
	},
	click(this: Box, event: UserEvent) {
		event.subject = "";
		if (event.altKey && getHeader(this, event.target as Node)) {
			let range = event.on.ownerDocument.createRange();
			range.selectNode(event.on);
			event.frame.selectionRange = range;
		}
	},
});