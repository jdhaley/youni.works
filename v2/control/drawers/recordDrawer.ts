import { ContentView } from "../../base/viewer.js";
import { ELE } from "../../base/dom.js";

export const recordDrawer = {
	memberType: "field",

	drawValue(this: ContentView, model: unknown): void {
		for (let name in this.type.types) {
			viewMember(this, name, model ? model[name] : undefined);
		}
	},
	drawElement(this: ContentView, content: ELE): void {
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

function viewMember(editor: ContentView, name: string, value: any): ContentView {
	let type = editor.type.types[name];
	let member = type.create();
	member.view.classList.add("field");
	editor.content.append(member.view);
	member.draw(value);
	//TODO contentedit refactoring - remove cast once refactoring complete
	return member as ContentView;
}
