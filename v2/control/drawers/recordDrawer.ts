import { ContentView } from "../../base/viewer.js";
import { ELE } from "../../base/dom.js";
import { Box } from "../box.js";

export const recordDrawer = {
	memberType: "field",

	draw(this: Box, model: unknown): void {
		this.box();
		for (let name in this.type.types) {
			let box = createMember(this, name, model ? model[name] : undefined);
			box.draw(model[name]);
		}
	},
	drawElement(this: Box, content: ELE): void {
		this.box(content.id);
		let level = content.getAttribute("level");
		if (level) this.view.setAttribute("aria-level", level);
		/*
			viewElement is called via a replace command. Because the range may only include a
			subset of the fields, we no longer create the entire record - only those in the command.
		*/

	//	let idx = {};
		for (let member of content.children) {
			let box = createMember(this, member.nodeName, member);
			box.drawElement(member);
	//		idx[member.nodeName] = member;
		}
		// for (let name in this.type.types) {
		// 	viewMember(this, name, idx[name]);
		// }
	},
}

function createMember(editor: Box, name: string, value: any): Box {
	let type = editor.type.types[name];
	let member = type.create() as Box;
	member.view.classList.add("field");
	editor.body.view.append(member.view);
	return member;
}
