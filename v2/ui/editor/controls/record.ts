import {content, Record} from "../../../base/model.js";

import { RecordReplace } from "../commands/replace.js";
import { Editor } from "../../../base/editor.js";
import { BaseEditor, getViewer } from "./editor.js";

export class RecordEditor extends BaseEditor {
	contentType = "record";
	viewContent(model: content): void {
		this.draw();
		//view["$at"] = Object.create(null);
		for (let name in this.type.types) {
			let type = this.type.types[name];
			let value = model ? model[name] : null;
			let member = type.view(value);
			member.classList.add("field");
			this.content.append(member);
			//view["$at"][name] = member;
		}
	}
	contentOf(range?: Range): content {
		let model = recordContent(null, this.content as Element, range);
		if (model) {
			model["type$"] = this.type.name;
		}
		return model;
	}
	edit(commandName: string, range: Range, record: Record) {
		if (getViewer(range) != this) console.warn("Invalid edit range");
		if (record && typeof record[0] == "object") record = record[0] as Record;
		return new RecordReplace(this.owner, commandName, this.node.id).exec(range, record);
	}
}

function recordContent(model: Record, view: Element, range: Range): Record {
	if (range && !range.intersectsNode(view)) return model;
	
	for (let child of view.children) {
		if (child.classList.contains("field")) {
			let viewer = child["$control"] as Editor;
			let value = viewer.contentOf(range);
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
