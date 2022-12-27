import { ContentView } from "../../base/viewer.js";
import { ELE } from "../../base/dom.js";
import { Box } from "../box.js";

export const recordDrawer = {
	memberType: "field",

	drawValue(this: Box, model: unknown): void {
		this.box();
		for (let name in this.type.types) {
			viewMember(this, name, model ? model[name] : undefined);
		}
	},
	drawElement(this: Box, content: ELE): void {
		this.box();
		/*
			viewElement is called via a replace command. Because the range may only include a
			subset of the fields, we no longer create the entire record - only those in the command.
		*/

	//	let idx = {};
		for (let member of content.children) {
			viewMember(this, member.nodeName, member);
	//		idx[member.nodeName] = member;
		}
		// for (let name in this.type.types) {
		// 	viewMember(this, name, idx[name]);
		// }
	},
}

function viewMember(editor: Box, name: string, value: any): ContentView {
	let type = editor.type.types[name];
	let member = type.create();
	member.view.classList.add("field");
	editor.body.view.append(member.view);
	member.draw(value);
	//TODO contentedit refactoring - remove cast once refactoring complete
	return member as ContentView;
}
