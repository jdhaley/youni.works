import { Shape } from "../../base/shape.js";
import { extend } from "../../base/util.js";
import { UserEvent } from "../../ui/ui.js";

let tracking = {
//	range: null,
	type: "",
	x: 0,
	y: 0
}

function getNode(shape: Shape) {
	return (shape as any).node;
}

export default extend(null, {
    mousedown(this: Shape, event: UserEvent) {
		event.subject = "";
		let area = this.area;
		tracking.x = event.x - area.x;
		tracking.y = event.y - area.y;
		tracking.type = this.zone(event.x, event.y) == "CC" ? "move" : "size";
		event.track = getNode(this);
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
		this.setStyle("background-color", "ghostwhite");
		getNode(this).setAttribute("data-zone", this.zone(event.x, event.y));
	},
    mouseout(this: Shape, event: UserEvent) {
		event.subject = "";
		if (event.track) return;
		this.setStyle("background-color");
		getNode(this).removeAttribute("data-zone");
	},
    // click(event: UserEvent) {
	// },
    // dblclick(event: UserEvent) {
	// }
});