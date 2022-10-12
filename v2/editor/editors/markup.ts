import { value } from "../../base/model.js";
import { Change } from "../../base/view.js";
import { Editor } from "../../base/editor.js";

import { LevelCommand } from "../commands/level.js";
import { MarkupReplace } from "../commands/markupReplace.js";
import { getChildEditor, getEditor } from "../util.js";
import { RANGE } from "../../base/ele.js";

export default function edit(this: Editor, commandName: string, range: RANGE, content: string) {
	if (getEditor(range) != this) console.warn("fix this check"); //"Invalid edit range"
	let cmd = COMMANDS[commandName];
	if (!cmd) throw new Error("Unrecognized command");
	range = cmd.call(this, commandName, range, content);
	this.owner.sense(new Change(commandName, this), this.node);
	return range;
}

const COMMANDS = {
	"Cut": replace,
	"Paste": replace,
	"Insert": replace,

	"Entry": replace,
	"Erase": replace,
	"Delete": replace,
	"Promote": level,
	"Demote": level,
	"Split": replace,
	"Join": replace,
}

function replace(this: Editor, commandName: string, range: RANGE, content?: value): RANGE {
	let editor = getEditor(range);
	if (editor.contentType == "line") {
		editor = getEditor(editor.node.parentNode);
	}
	if (editor.contentType != "markup") console.warn("View is not markup:", editor);

	return new MarkupReplace(this.owner, commandName, editor.node.id).exec(range, content);
}

function level(this: Editor, name: "Promote" | "Demote", range: RANGE): RANGE {
	if (!this.content.firstElementChild) return;
	let start = getChildEditor(this, range.startContainer);
	let end = getChildEditor(this, range.endContainer);
	//If a range of items, check that there are no headings
	if (start != end) for (let item = start.node; item; item = item.nextElementSibling) {
		let role = getEditor(item).type.name;
		if (role == "heading") {
			console.warn("No range promote with headings");
			return range;
		}
		if (item.id == end.node.id) break;
	}
	return new LevelCommand(this.owner, name, this.node.id).exec(range);
}