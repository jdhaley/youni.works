import {extend} from "../../base/util.js";
import {UserEvent} from "../ui.js";
import {Editor} from "../editor/editor.js";
import {getHeader} from "../editor/util.js";
import editable from "./editable.js";

export default extend(editable, {
	click(this: Editor, event: UserEvent) {
		let view = event.on;
		let header = getHeader(event.on, event.target as Node);
		if (header) {
			event.subject = "";
			if (view.classList.contains("collapsed")) {
				view.classList.remove("collapsed");
			} else {
				view.classList.add("collapsed");
			}
		}
	}
});
