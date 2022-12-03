import { Shape } from "../../base/shape.js";
import { extend } from "../../base/util.js";
import { UserEvent } from "../../control/frame.js";

let tracking = {
	target: null,
	type: "",
	x: 0,
	y: 0
}

function getNode(shape: Shape) {
	return (shape as any).view;
}

//let NEXTID = 0;
export default extend(null, {
    pointerdown(this: Shape, event: UserEvent) {
		(event.on as Element).setPointerCapture(event.pointerId);
		event.subject = "";
		let area = this.area;
		tracking.target = this;
		tracking.x = event.x - area.x;
		tracking.y = event.y - area.y;
		tracking.type = this.zone(event.x, event.y) == "CC" ? "move" : "size";
		this.size(this.area.width, this.area.height);
	},
	pointerup(event: UserEvent) {
		(event.on as HTMLElement).releasePointerCapture(event.pointerId);
		event.subject = "";
		tracking.target = null;
	},
    pointermove(this: Shape, event: UserEvent) {
		event.subject = "";
		if (tracking.target == this) {
			let x = event.x - tracking.x;
			let y = event.y - tracking.y;
			if (tracking.type == "move") this.position(x, y); else this.size(x, y);
			return;
		}
		this.setStyle("background-color", "ghostwhite");
		getNode(this).setAttribute("data-zone", this.zone(event.x, event.y));
	},
    pointerout(this: Shape, event: UserEvent) {
		event.subject = "";
		this.setStyle("background-color");
		getNode(this).removeAttribute("data-zone");
	},
    // click(event: UserEvent) {
	// },
    // dblclick(event: UserEvent) {
	// }
});