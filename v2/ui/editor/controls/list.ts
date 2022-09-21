import {content, List} from "../../../base/model.js";

import { ListReplace } from "../commands/replace.js";
import { getEditableView } from "../util.js";
import { Display } from "../../display/display.js";
import { viewType } from "../../../base/editor.js";

export class ListEditor extends Display {
	contentType = "list";
	viewContent(model: List): void {
		this.draw();
		if (model && model[Symbol.iterator]) for (let item of model) {
			let type = this.type;
			type = type.types[viewType(item)] || type.owner.unknownType;
			let part = type.view(item) as Element;
			this.content.append(part);
		}
	}
	contentOf(range?: Range): List {
		let model: content[];
		if (range && !range.intersectsNode(this.content)) return;
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
		if (view.$control.contentType != "list") console.warn("View is not a list:", view);
	
		return new ListReplace(this.owner, commandName, view.id).exec(range, content);
	}
}
