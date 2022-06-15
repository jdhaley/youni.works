import {extend} from "../../base/util.js";
import view from "./view.js";

export default extend(view, {
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
	// delete(this: Editor, event: UserEvent) {
	// 	event.subject = "";
	// 	let range = this.owner.selectionRange;
	// 	if (range.collapsed) return;
	// 	range = adjustRange(range, getElement(range, "list"));
	// 	range = this.edit("Delete", range, "");
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
