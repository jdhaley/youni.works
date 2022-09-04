import { content } from "../../base/model.js";

import { Editable, Editor } from "./editor.js";
import { LevelCommand } from "./level.js";
import { MarkupReplace } from "./replace.js";
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

	"Entry": noop,
	"Erase": replace,
	"Delete": noop,
	"Promote": level,
	"Demote": level,
	"Split": replace,
	"Join": replace,
}

function noop() {
}

function replace(this: Editor, commandName: string, range: Range, content?: content): Range {
	let view = getEditableView(range);
	if (view.$controller.model == "line") {
		view = getEditableView(view.parentElement);
	}
	if (view.$controller.model != "markup") console.warn("View is not markup:", view);

	return new MarkupReplace(this.owner, commandName, view.id).exec(range, content);
}

function getThisView(editor: Editor, node: Range | Node): Editable {
	if (node instanceof Range) node = node.commonAncestorContainer;
	while (node && node["$controller"] != editor) {
		node = node.parentElement;
	}
	return node as Editable;
}
function level(this: Editor, name: "Promote" | "Demote", range: Range): Range {
	let view = getThisView(this, range);
	let content = this.getContentOf(view);
	let start: Editable = getChildView(content, range.startContainer);
	let end: Editable = getChildView(content, range.endContainer);
	//If a range of items, check that there are no headings
	if (start != end) for (let item = start; item; item = item.nextElementSibling) {
		let role = item.$controller.name;
		if (role == "heading") {
			console.warn("No range promote with headings");
			return range;
		}
		if (item.id == end.id) break;
	}
	return new LevelCommand(this.owner, name, view.id).exec(range);
}