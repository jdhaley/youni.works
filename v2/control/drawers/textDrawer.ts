import { Box } from "../box.js";

export const textDrawer = {
	draw(this: Box, model: undefined): void {
		this.box();
		this.body.view.textContent = model ? "" + model : "";
	}
}
