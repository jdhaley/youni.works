import { RANGE } from "../../base/dom.js";
import { Editor } from "../../base/editor.js";
import { value } from "../../base/model.js";

import { ListReplace } from "../commands/listReplace.js";
import { getEditor, senseChange } from "../util.js";

export default function edit(this: Editor, commandName: string, range: RANGE, content?: value): void {
	if (getEditor(range) != this) console.warn("Invalid edit range.");
	let r = range.cloneRange();
	r = new ListReplace(this.type.context, commandName, this.id).exec(r, content);
	r.collapse();
	this.type.context.selectionRange = r;
	senseChange(this, commandName);
}
