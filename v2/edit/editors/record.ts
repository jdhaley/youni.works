import { record } from "../../base/model.js";
import { Editor } from "../../base/editor.js";

import { RecordReplace } from "../commands/recordReplace.js";
import { getEditor, senseChange } from "../util.js";
import { ELE, RANGE } from "../../base/dom.js";

export default function edit(this: Editor, commandName: string, range: RANGE, record: record) {
	if (getEditor(range) != this) console.warn("Invalid edit range");
	if (record && typeof record[0] == "object") record = record[0] as record;
	range = new RecordReplace(this.owner, commandName, this.id).exec(range, record);
	senseChange(this, commandName);
	return range;
}
