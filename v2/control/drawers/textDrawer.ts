import { ELE } from "../../base/dom.js";
import { Box } from "../box.js";

export const textDrawer = {
	draw(this: Box, model: undefined): void {
		this.box();
		this.body.view.textContent = model ? "" + model : "";
	},
	drawElement(this: Box, ele: ELE) {
		this.box(ele.id);
		let level = ele.getAttribute("level");
		if (level) this.view.setAttribute("aria-level", level);
		//even with plain text, always use HTML so that the marker is transferred to the view.
		this.body.view.innerHTML = ele.innerHTML;
	}
}
