import { ELE } from "../../base/dom.js";
import { ContentView } from "../../base/viewer.js";

export const textDrawer = {
	drawValue(this: ContentView, model: undefined): void {
		this.content.textContent = model ? "" + model : "";
	},
	drawElement(this: ContentView, ele: ELE) {
		//even with plain text, always use HTML so that the marker is transferred to the view.
		this.content.innerHTML = ele.innerHTML;
	}
}
