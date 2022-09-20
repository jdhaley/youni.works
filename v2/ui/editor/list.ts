import {content, List, viewType} from "../../base/model.js";
import { ViewType } from "../../base/editor.js";

import { ListReplace } from "./commands/replace.js";
import { getEditableView } from "./util.js";
import { Display } from "../display/display.js";

export class ListEditor extends Display {
	viewContent(model: List): void {
		this.draw();
		if (model && model[Symbol.iterator]) for (let item of model) {
			let type = this.type as ViewType;
			type = type.types[viewType(item)] || type.owner.unknownType;
			let part = type.view(item) as Element;
			this.content.append(part);
		}
	}
	contentOf(range?: Range): List {
		let model: content[];
		if (range && !this.intersectsRange(range)) return;
		for (let part of this.content.children) {
			let view = part.$control;
			let value = view?.contentOf(range);
			if (value) {
				if (!model) {
					model = [];
					if (this.type.name) model["type$"] = this.type.name;
				}
				model.push(value);
			}
		}
		return model;
	}
	edit(commandName: string, range: Range, content?: content): Range {
		let view = getEditableView(range);
		if (view.$control.type.contentType != "list") console.warn("View is not a list:", view);
	
		return new ListReplace(this.owner, commandName, view.id).exec(range, content);
	}
}


// function getContentElement(view: View, range?: Range) {
// 	if (range && !range.intersectsNode(view as Element)) return;
// 	if (view.classList.contains("content")) return view;
// 	for (let child of view.children) {
// 		child = getContentElement(child, range);
// 		if (child) return child;
// 	}
// }

