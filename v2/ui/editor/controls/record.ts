import {content, Record, Viewer} from "../../../base/model.js";

import { RecordReplace } from "../commands/replace.js";
import { getEditableView } from "../util.js";
import { Display } from "../../display/display.js";

export class RecordEditor extends Display {
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
		if (record && typeof record[0] == "object") record = record[0] as Record;
		let view = getEditableView(range);
		if (view?.$control.type.contentType != "record") {
			console.error("Invalid range for edit.");
			return;
		}
		return new RecordReplace(this.owner, commandName, view.id).exec(range, record);
	}
}

function recordContent(model: Record, view: Element, range: Range): Record {
	if (range && !range.intersectsNode(view)) return model;
	
	for (let child of view.children) {
		if (child.classList.contains("field")) {
			let viewer = child["$control"] as Viewer;
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
