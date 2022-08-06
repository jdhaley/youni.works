import {extend} from "../../base/util.js";
import {UserEvent} from "../ui.js";
import {Editor} from "../editor/article.js";
import {getHeader} from "../editor/edit.js";
import view from "./view.js";

export default extend(view, {
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
