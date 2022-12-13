import { Editor } from "../../base/editor.js";
import { ele, ELE, NODE, RANGE } from "../../base/dom.js";

import { getEditor, senseChange } from "../editUtil.js";
import { RangeReplace } from "../commands/rangeReplaceCmd.js";

export const recordEd = {
	exec(this: Editor, commandName: string, range: RANGE, record: unknown): void {
		if (getEditor(range) != this) console.warn("Invalid edit range");
		if (record && typeof record[0] == "object") record = record[0];

		let r = range.cloneRange();
		r = new RangeReplace(this.type.context, commandName, this.id).exec(r, record);
		r.collapse();
		this.type.context.selectionRange = r;
		senseChange(this, commandName);
	},
	valueOf(this: Editor, range?: RANGE): unknown {
		let model = recordContent(null, this.content as ELE, range);
		if (model) {
			model["type$"] = this.type.name;
		}
		return model;
	}
}

function recordContent(model: Object, view: NODE, range: RANGE): Object {
	if (range && !range.intersectsNode(view)) return model;
	
	for (let child of view.childNodes) {
		if (ele(child)?.classList.contains("field")) {
			let viewer = child["$control"] as Editor;
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
