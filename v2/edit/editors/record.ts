import { record } from "../../base/model.js";
import { RANGE } from "../../base/dom.js";

import { Editor, getEditor, senseChange } from "../util.js";
import { RangeReplace } from "../commands/rangeReplace.js";

export default function edit(this: Editor, commandName: string, range: RANGE, record: record): void {
	if (getEditor(range) != this) console.warn("Invalid edit range");
	if (record && typeof record[0] == "object") record = record[0] as record;

	let r = range.cloneRange();
	r = new RangeReplace(this.type.owner, commandName, this.id).exec(r, record);
	r.collapse();
	this.type.owner.selectionRange = r;
	senseChange(this, commandName);
}
