import { value } from "../../base/model.js";
import { Editor } from "../../base/editor.js";

import { LevelCommand } from "../commands/level.js";
import { MarkupReplace } from "../commands/markupReplace.js";
import { getChildEditor, getEditor, senseChange } from "../util.js";
import { ELE, RANGE } from "../../base/dom.js";

export default function edit(this: Editor, commandName: string, range: RANGE, content: string) {
	if (getEditor(range) != this) console.warn("fix this check"); //"Invalid edit range"
	let cmd = COMMANDS[commandName];
	if (!cmd) throw new Error("Unrecognized command");
	range = cmd.call(this, commandName, range, content);
	senseChange(this, commandName);
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
	if (editor.contentType != "list") {
		editor = getEditor(editor.node.parentNode);
	}
	if (editor != this) console.warn("Invalid edit range.", editor);

	return new MarkupReplace(this.type.owner, commandName, editor.id).exec(range, content);
}

function level(this: Editor, name: "Promote" | "Demote", range: RANGE): RANGE {
	if (!this.content.contents.length) return;
	let start = getChildEditor(this, range.startContainer);
	let end = getChildEditor(this, range.endContainer);
	//If a range of items, check that there are no headings
	if (start != end) for (let item = start.node as ELE; item; item = item.nextElementSibling) {
		let role = getEditor(item).type.name;
		if (role == "heading") {
			console.warn("No range promote with headings");
			return range;
		}
		if (item.id == end.id) break;
	}
	return new LevelCommand(this.type.owner, name, this.id).exec(range);
}