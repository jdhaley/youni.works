import {extend} from "../../base/util.js";
import { Editor } from "../article.js";
import { Display, getHeader } from "../display.js";
import { UserEvent } from "../ui.js";
import view from "./view.js";
export default extend(view, {
	dblclick(this: Editor, event: UserEvent) {
		event.subject = "";
		let view = event.on as Display;
		let header = getHeader(event.on, event.target as Node);
		if (header) {
			if (view.classList.contains("collapsed")) {
				view.classList.remove("collapsed");
			} else {
				view.classList.add("collapsed");
			}
			// if (content.style.display == "none") {
			// 	header.classList.remove("collapsed")
			// 	content.style.display = content["restore_display"];
			// 	if (view.v_footer) {
			// 		view.v_footer.style.display = view.v_footer["restore_display"];
			// 	}
			// } else {
			// 	header.classList.add("collapsed")
			// 	content["restore_display"] = content.style.display;
			// 	content.style.display = "none";
			// 	if (view.v_footer) {
			// 		view.v_footer["restore_display"] = view.v_footer.style.display;
			// 		view.v_footer.style.display = "none";
			// 	}
			// }
		}
	}
	// copy(this: Editor, event: UserEvent) {
	// 	event.subject = "";
	// 	let range = this.owner.selectionRange;
	// 	range = adjustRange(range, getElement(range, "list"));
	// 	event.clipboardData.setData("text/json", JSON.stringify(this.toModel(range)));
	// },
	// cut(this: Editor, event: UserEvent) {
	// 	event.subject = "";
	// 	let range = this.owner.selectionRange;
	// 	if (range.collapsed) return;
	// 	range = adjustRange(range, getElement(range, "list"));
	// 	event.clipboardData.setData("text/json", JSON.stringify(this.toModel(range)));
	// 	range = this.edit("Cut", range, "");
	// 	range.collapse();
	// },
	// paste(this: Editor, event: UserEvent) {
	// 	event.subject = "";
	// 	let range = this.owner.selectionRange;
	// 	let data = event.clipboardData.getData("text/json");
	// 	console.log(data);
	// 	let model = JSON.parse(data);
	// 	let view = this.type.toView(model, this.view);
	// 	range = this.edit("Paste", range, view.innerHTML);
	// 	range.collapse();
	// },
});
