import {content} from "../../base/model.js";

import { Editor } from "./editor.js";
import { ListReplace } from "./commands/replace.js";
import { getEditableView } from "./util.js";

export default function edit(this: Editor, commandName: string, range: Range, content?: content): Range {
	let view = getEditableView(range);
	if (view.$controller.contentType != "list") console.warn("View is not a list:", view);

	return new ListReplace(this.owner, commandName, view.id).exec(range, content);
}
