import { RANGE } from "../../base/dom.js";
import { Editor } from "../../base/editor.js";

import { ListReplace } from "../commands/listReplaceCmd.js";
import { getEditor, senseChange } from "../editUtil.js";

export const listEd = {
	exec(this: Editor, commandName: string, range: RANGE, content?: unknown): void {
		if (getEditor(range) != this) console.warn("Invalid edit range.");
		let r = range.cloneRange();
		r = new ListReplace(this.type.context, commandName, this.id).exec(r, content);
		r.collapse();
		this.type.context.selectionRange = r;
		senseChange(this, commandName);
	},
	valueOf(this: Editor, range?: RANGE): unknown {
		let model: unknown[];
		if (range && !range.intersectsNode(this.content)) return;
		for (let part of this.content.childNodes) {
			let editor = getEditor(part);

			//The part isn't an editable part...
			if (editor == this) {
				console.warn("Invalid part", part);
				continue;
			}
			let value = editor?.valueOf(range);
			if (value) {
				if (!model) {
					model = [];
					if (this.type.name) model["type$"] = this.type.name;
				}
				model.push(value);
			}
		}
		return model;
	},
}
