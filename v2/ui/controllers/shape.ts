import { extend } from "../../base/util.js";
import { Shape } from "../devt_item/shape.js";
import { UserEvent } from "../ui.js";

let inbox = {
	x: 0,
	y: 0
}
export default extend(null, {
    mousedown(event: UserEvent) {
		for (let view of this.owner.view.children) view.contentEditable = "false";
		let box = this.box;
		inbox.x = event.x - box.x;
		inbox.y = event.y - box.y;
		
		event.track = this._view;
		this.owner.selectionRange = null;
	},
	mouseup(event: UserEvent) {
		for (let view of this.owner.view.children) view.contentEditable = "true";
		event.track = null;
	},
    mousemove(this: Shape, event: UserEvent) {
		if (event.track) {
			let x = event.x - inbox.x;
			let y = event.y - inbox.y;
			console.log(x, y);
			this.position(x, y);
			return;
		}
		event.subject = "";
		this.style.backgroundColor = "ghostwhite";
		switch (this.edge(event.x, event.y)) {
			case "TL":
			case "BR":
				this.style.cursor = "nwse-resize"; return;
			case "TC":
			case "BC":
				this.style.cursor = "ns-resize"; return;
			case "TR":
			case "BL":
				this.style.cursor = "nesw-resize"; return;
			case "CL":
			case "CR":
				this.style.cursor = "ew-resize"; return;
			case "CC":
				this.style.cursor = "move"; return;
		}
	},
    mouseout(event: UserEvent) {
		if (event.track) return;
		this.style.removeProperty("background-color");
	},
    // click(event: UserEvent) {
	// },
    // dblclick(event: UserEvent) {
	// }
});