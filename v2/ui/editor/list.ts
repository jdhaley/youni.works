import {content} from "../../base/model.js";
import { ViewType } from "../../base/editor";

import { ListReplace } from "./commands/replace.js";
import { getEditableView } from "./util.js";

export default function edit(this: ViewType, commandName: string, range: Range, content?: content): Range {
	let view = getEditableView(range);
	if (view.$control.type.contentType != "list") console.warn("View is not a list:", view);

	return new ListReplace(this.owner, commandName, view.id).exec(range, content);
}
