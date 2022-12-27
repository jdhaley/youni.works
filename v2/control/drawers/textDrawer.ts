import { ELE } from "../../base/dom.js";
import { ContentView } from "../../base/viewer.js";
import { Box } from "../box.js";

export const textDrawer = {
	drawValue(this: Box, model: undefined): void {
		this.box();
		this.body.view.textContent = model ? "" + model : "";
	},
	drawElement(this: Box, ele: ELE) {
		this.box();
		//even with plain text, always use HTML so that the marker is transferred to the view.
		this.body.view.innerHTML = ele.innerHTML;
	}
}
