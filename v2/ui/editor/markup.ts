import { content, Editable, ViewType } from "../../base/model.js";

import { LevelCommand } from "./commands/level.js";
import { MarkupReplace } from "./commands/replace.js";
import { getChildView, getEditableView } from "./util.js";

export default function edit(commandName: string, range: Range, content: string) {
	let cmd = COMMANDS[commandName];
	if (!cmd) throw new Error("Unrecognized command");
	return cmd.call(this, commandName, range, content);
}

const COMMANDS = {
	"Cut": replace,
	"Paste": replace,
	"Insert": noop,

	"Entry": replace,
	"Erase": replace,
	"Delete": replace,
	"Promote": level,
	"Demote": level,
	"Split": replace,
	"Join": replace,
}

function noop() {
}

function replace(this: ViewType, commandName: string, range: Range, content?: content): Range {
	let view = getEditableView(range);
	if (view.$control.type.contentType == "line") {
		view = getEditableView(view.parentElement);
	}
	if (view.$control.type.contentType != "markup") console.warn("View is not markup:", view);

	return new MarkupReplace(this.owner, commandName, view.id).exec(range, content);
}

function getThisView(editor: ViewType, node: Range | Node): Editable {
	if (node instanceof Range) node = node.commonAncestorContainer;
	while (node && node["$control"].type != editor) {
		node = node.parentElement;
	}
	return node as Editable;
}
function level(this: ViewType, name: "Promote" | "Demote", range: Range): Range {
	let view = getThisView(this, range);
	let content = view.$control.content as Element;
	if (!content.firstElementChild) return;
	let start: Editable = getChildView(content, range.startContainer);
	let end: Editable = getChildView(content, range.endContainer);
	//If a range of items, check that there are no headings
	if (start != end) for (let item = start; item; item = item.nextElementSibling) {
		let role = item.$control.type.name;
		if (role == "heading") {
			console.warn("No range promote with headings");
			return range;
		}
		if (item.id == end.id) break;
	}
	return new LevelCommand(this.owner, name, view.id).exec(range);
}