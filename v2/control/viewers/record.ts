import { ELE, NODE, RANGE, ele } from "../../base/dom.js";
import { View, getView } from "../../base/view.js";

export const record = {
	//memberType = "field";

	get(this: View, name: string): View {
		for (let node of this.content.childNodes) {
			let view = getView(node);
			if (name == view?.type.name) return view;
		}
	},

	// get title(): string {
	// 	return this.get("title").content.textContent;
	// }
	viewValue(this: View, model: unknown): void {
		for (let name in this.type.types) {
			viewMember(this, name, model ? model[name] : undefined);
		}
	},
	viewElement(this: View, content: ELE): void {
		/*
			viewElement is called via a replace command. Because the range may only include a
			subset of the fields, we no longer create the entire record - only those in the command.
		*/

	//	let idx = {};
		console.log("record elements...")
		for (let member of content.children) {
			viewMember(this, member.nodeName, member);
	//		idx[member.nodeName] = member;
		}
		// for (let name in this.type.types) {
		// 	viewMember(this, name, idx[name]);
		// }
	},
	valueOf(this: View, range?: RANGE): unknown {
		let model = recordContent(null, this.content as ELE, range);
		if (model) {
			model["type$"] = this.type.name;
		}
		return model;
	}
}

function viewMember(editor: View, name: string, value: any): View {
	let type = editor.type.types[name];
	let member = type.create(value);
	member.view.classList.add("field");
	editor.view.append(member.view);
	return member;
}

function recordContent(model: Object, view: NODE, range: RANGE): Object {
	if (range && !range.intersectsNode(view)) return model;
	
	for (let child of view.childNodes) {
		if (ele(child)?.classList.contains("field")) {
			let viewer = child["$control"] as View;
			let value = viewer.valueOf(range);
			if (value) {
				if (!model) model = Object.create(null);
				model[viewer.type.name] = value;
			}
		} else {
			model = recordContent(model, child, range);
		}
	}
	return model;
}
