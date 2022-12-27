import { Box } from "../box.js";

export const recordDrawer = {
	memberType: "field",

	draw(this: Box, model: unknown): void {
		this.box();
		for (let name in this.type.types) {
			let box = this.type.createMember(this, name);
			box.draw(model ? model[name] : undefined);
		}
	}
}
