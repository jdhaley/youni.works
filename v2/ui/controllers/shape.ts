import { extend } from "../../base/util.js";
import { Shape } from "../devt_item/shape.js";
import { UserEvent } from "../ui.js";

let tracking = {
//	range: null,
	type: "",
	x: 0,
	y: 0
}

export default extend(null, {
    mousedown(this: Shape, event: UserEvent) {
		event.subject = "";
		let area = this.area;
		tracking.x = event.x - area.x;
		tracking.y = event.y - area.y;
		tracking.type = this.zone(event.x, event.y) == "CC" ? "move" : "size";
		event.track = this._node;
	},
	mouseup(event: UserEvent) {
		event.subject = "";
		event.track = null;
	},
    mousemove(this: Shape, event: UserEvent) {
		event.subject = "";
		if (event.track) {
			let x = event.x - tracking.x;
			let y = event.y - tracking.y;
			console.log(x, y);
			if (tracking.type == "move") this.position(x, y);
			return;
		}
		this.style.backgroundColor = "ghostwhite";
		switch (this.zone(event.x, event.y)) {
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
		event.subject = "";
		if (event.track) return;
		this.style.removeProperty("background-color");
	},
    // click(event: UserEvent) {
	// },
    // dblclick(event: UserEvent) {
	// }
});