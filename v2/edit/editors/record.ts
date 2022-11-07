import { record } from "../../base/mvc.js";
import { RANGE } from "../../base/dom.js";

import { Editor } from "../editor.js";
import { getEditor, senseChange } from "../util.js";
import { RangeReplace } from "../commands/rangeReplace.js";

export default function edit(this: Editor, commandName: string, range: RANGE, record: record) {
	if (getEditor(range) != this) console.warn("Invalid edit range");
	if (record && typeof record[0] == "object") record = record[0] as record;
	range = new RangeReplace(this.type.owner, commandName, this.id).exec(range, record);
	senseChange(this, commandName);
	return range;
}
