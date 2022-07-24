import {extend} from "../../base/util.js";
import { Editor } from "../article.js";
import { Display, getHeader } from "../display.js";
import { UserEvent } from "../ui.js";
import view from "./view.js";
export default extend(view, {
	dblclick(this: Editor, event: UserEvent) {
		event.subject = "";
		let view = event.on as Display;
		if (getHeader(event.on, event.target as Node)) {
			if(view.type$.propertyName=="tasks") {
				let content = view.v_content;
				content.hidden = content.hidden ? false : true;
			}
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
