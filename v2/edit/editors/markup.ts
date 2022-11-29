import { value } from "../../base/model.js";
import { ELE, RANGE } from "../../base/dom.js";

import { LevelCommand } from "../commands/level.js";
import { MarkupReplace } from "../commands/markupReplace.js";
import { getChildEditor, getEditor, senseChange } from "../util.js";
import { Editor } from "../../base/editor.js";

export default function edit(this: Editor, commandName: string, range: RANGE, content: string): void {
	if (getEditor(range) != this) console.warn("fix this check"); //"Invalid edit range"
	let cmd = COMMANDS[commandName];
	if (!cmd) throw new Error("Unrecognized command");

	let r = range.cloneRange();
	r = cmd.call(this, commandName, r, content);
	r.collapse();
	this.type.context.selectionRange = r;

	senseChange(this, commandName);
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
	if (editor.type.model != "list") {
		editor = getEditor(editor.view.parentNode);
	}
	if (editor != this) console.warn("Invalid edit range.", editor);

	return new MarkupReplace(this.type.context, commandName, editor.id).exec(range, content);
}

function level(this: Editor, name: "Promote" | "Demote", range: RANGE): RANGE {
	if (!this.content.childNodes.length) return;
	let start = getChildEditor(this, range.startContainer);
	let end = getChildEditor(this, range.endContainer);
	//If a range of items, check that there are no headings
	if (start != end) for (let item = start.view as ELE; item; item = item.nextElementSibling) {
		let role = getEditor(item).type.name;
		if (role == "heading") {
			console.warn("No range promote with headings");
			return range;
		}
		if (item.id == end.id) break;
	}
	return new LevelCommand(this.type.context, name, this.id).exec(range);
}