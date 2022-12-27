import { ELE } from "../../base/dom.js";
import { Part } from "../../base/viewer.js";

export const lineDrawer = {
	drawValue(content: Part): void {
		this.box();
		this.content.innerHTML = (content ? "" + content.content : "");
		this.level = content.level;	
	},
	drawElement(content: ELE): void {
		this.box();
		this.content.innerHTML = content.innerHTML;
		this.level = Number.parseInt(content.getAttribute("level"));
	},
}
