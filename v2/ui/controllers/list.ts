import {extend} from "../../base/util.js";
import {UserEvent} from "../ui.js";
import {Editor} from "../editor/editor.js";
import {getHeader} from "../editor/util.js";
import editable from "./editable.js";

export default extend(editable, {
	dblclick(this: Editor, event: UserEvent) {
		event.subject = "";
		let view = event.on;
		let header = getHeader(event.on, event.target as Node);
		if (header) {
			if (view.classList.contains("collapsed")) {
				view.classList.remove("collapsed");
			} else {
				view.classList.add("collapsed");
			}
		}
	}
});
