import { Editor } from "../../base/editor.js";
import { value } from "../../base/model.js";
import { Change } from "../../base/view.js";

import { ListReplace } from "../commands/listReplace.js";
import { getEditor } from "../util.js";

export default function edit(this: Editor, commandName: string, range: Range, content?: value): Range {
	if (getEditor(range) != this) console.warn("Invalid edit range");
	range = new ListReplace(this.owner, commandName, this.node.id).exec(range, content);
	this.owner.sense(new Change(commandName, this), this.node);
	return range;
}
