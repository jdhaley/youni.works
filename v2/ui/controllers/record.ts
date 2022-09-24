import { extend } from "../../base/util.js";
import { getHeader } from "../../editor/util.js";
import { UserEvent } from "../ui.js";
import editable from "./editor.js";

export default extend(editable, {
	dblclick(event: UserEvent) {
		event.subject = "";
		if (getHeader(event.on, event.target as Node)) {
			let range = event.on.ownerDocument.createRange();
			range.selectNode(event.on);
			event.frame.selectionRange = range;
		}
	},
});
