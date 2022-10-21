import { Editor } from "../../base/editor.js";
import { RANGE } from "../../base/dom.js";
import { value } from "../../base/model.js";

import { ListReplace } from "../commands/listReplace.js";
import { getEditor, senseChange } from "../util.js";

export default function edit(this: Editor, commandName: string, range: RANGE, content?: value): RANGE {
	if (getEditor(range) != this) console.warn("Invalid edit range.");
	range = new ListReplace(this.owner, commandName, this.id).exec(range, content);
	senseChange(this, commandName);
	return range;
}
