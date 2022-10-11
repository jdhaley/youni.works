import { record } from "../../base/model.js";
import { Change } from "../../base/view.js";
import { Editor } from "../../base/editor.js";

import { RecordReplace } from "../commands/recordReplace.js";
import { getEditor } from "../util.js";
import { RANGE } from "../../base/ele.js";

export default function edit(this: Editor, commandName: string, range: RANGE, record: record) {
	if (getEditor(range) != this) console.warn("Invalid edit range");
	if (record && typeof record[0] == "object") record = record[0] as record;
	range = new RecordReplace(this.owner, commandName, this.node.id).exec(range, record);
	this.owner.sense(new Change(commandName, this), this.node);
	return range;
}