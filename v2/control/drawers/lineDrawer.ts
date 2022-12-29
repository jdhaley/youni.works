import { Part } from "../../base/viewer.js";

export const lineDrawer = {
	draw(content: Part): void {
		this.box();
		this.content.innerHTML = (content ? "" + content.content : "");
		this.level = content.level;	
	}
}
