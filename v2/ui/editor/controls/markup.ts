import { content } from "../../../base/model.js";
import { View, ViewType } from "../../../base/editor.js";

import { LevelCommand } from "../commands/level.js";
import { MarkupReplace } from "../commands/replace.js";
import { getChildView } from "../util.js";
import { ListEditor } from "./list.js";
import { getEditor } from "./editor.js";

export class MarkupEditor extends ListEditor {
	contentType = "markup";
	edit(commandName: string, range: Range, content: string) {
		if (getEditor(range) != this) console.warn("fix this check"); //"Invalid edit range"
		let cmd = COMMANDS[commandName];
		if (!cmd) throw new Error("Unrecognized command");
		return cmd.call(this, commandName, range, content);
	}
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

function replace(this: MarkupEditor, commandName: string, range: Range, content?: content): Range {
	let editor = getEditor(range);
	if (editor.contentType == "line") {
		editor = getEditor(editor.node.parentElement);
	}
	if (editor.contentType != "markup") console.warn("View is not markup:", editor);

	return new MarkupReplace(this.owner, commandName, editor.node.id).exec(range, content);
}

function level(this: MarkupEditor, name: "Promote" | "Demote", range: Range): Range {
	let content = this.content as Element;
	if (!content.firstElementChild) return;
	let start: View = getChildView(content, range.startContainer);
	let end: View = getChildView(content, range.endContainer);
	//If a range of items, check that there are no headings
	if (start != end) for (let item = start; item; item = item.nextElementSibling) {
		let role = item.$control.type.name;
		if (role == "heading") {
			console.warn("No range promote with headings");
			return range;
		}
		if (item.id == end.id) break;
	}
	return new LevelCommand(this.owner, name, this.node.id).exec(range);
}