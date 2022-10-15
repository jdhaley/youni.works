import { Change } from "../../base/view.js";
import { Editor } from "../../base/editor.js";

import { getEditor, getHeader, mark, narrowRange, unmark } from "../util.js";
import { Replace } from "../commands/replace.js";
import { ele, RANGE } from "../../base/dom.js";

export default function	edit(this: Editor, commandName: string, range: RANGE, content: string): RANGE {
	if (getEditor(range) != this) console.warn("Invalid edit range");
	positionToText(range);
	let cmd = COMMANDS[commandName];
	if (!cmd) throw new Error("Unrecognized command");
	range = cmd.call(this, commandName, range, content);
	this.owner.sense(new Change(commandName, this), this.node);
	return range;
}

const COMMANDS = {
	"Cut": doit,
	"Paste": doit,
	"Replace": doit,
	"Insert": noop,

	"Entry": doit,
	"Erase": doit,
	"Delete": doit,
	"Promote": noop,
	"Demote": noop,
	"Split": noop,
	"Join": noop,
}

function noop() {
}

let lastEdit = {
	action: "",
	node: null,
	start: 0,
	end: 0
}
function doit(commandName: string, range: RANGE, text: string): RANGE {
	let node = range.commonAncestorContainer;
	let editor = getEditor(node);

	if (range.collapsed && commandName == "Erase") {
		if (!range.startOffset) return range;
	}

	if (range.collapsed && node == lastEdit.node) {
		let cmd = this.owner.commands.peek() as Replace;
		if (cmd?.name == commandName && editor?.id == cmd.viewId) {
			let r = doAgain(cmd, range, text);
			if (r) return r;		
		}
	}
	if (range.collapsed) {
		lastEdit.node = range.commonAncestorContainer

		if (commandName == "Erase") {
			//Extend the range over the character for the cmd.do()
			range.setStart(lastEdit.node, range.startOffset - 1);
		}
		lastEdit.start = range.startOffset;
		if (commandName == "Delete") {
			range.setEnd(lastEdit.node, range.endOffset + 1);
		}
		lastEdit.end = commandName == "Entry" ? range.endOffset + 1 : range.endOffset;
	} else {
		lastEdit.node = null;
	}

	return new Replace(this.owner, commandName, editor.id).exec(range, text);
}


function doAgain(cmd: Replace, range: RANGE, text: string) {
	let currentOffset = range.startOffset; //start & end are the same.
	switch (cmd.name) {
		case "Entry":
			if (currentOffset == lastEdit.end) {
				return editAgain(range, cmd,  text);
			}
			break;
		case "Delete":
			if (currentOffset == lastEdit.start) {
				return deleteAgain(range, cmd,  text);
			}
			break;
		case "Erase":
			if (currentOffset == lastEdit.start) {
				return eraseAgain(range, cmd);
			}
			break;
	}
}

function editAgain(range: RANGE, cmd: Replace, char: string) {
	let node = range.commonAncestorContainer;
	let text = node.textContent;
	text = text.substring(0, lastEdit.end) + char + text.substring(lastEdit.end);
	node.textContent = text;
	range.setStart(node, lastEdit.start);
	range.setEnd(node, ++lastEdit.end);

	return endagain(range, cmd);
}

function deleteAgain(range: RANGE, cmd: Replace, char: string) {
	let node = range.commonAncestorContainer;
	let text = node.textContent;
	text = text.substring(0, lastEdit.start) + text.substring(lastEdit.start + 1);
	node.textContent = text;
	range.setStart(node, lastEdit.start);
	range.collapse(true);
	return endagain(range, cmd);
}

function eraseAgain(range: RANGE, cmd: Replace) {
	let node = range.commonAncestorContainer;
	let text = node.textContent;
	text = text.substring(0, lastEdit.start - 1) + text.substring(lastEdit.start);
	node.textContent = text;

	range.setStart(node, --lastEdit.start);
	range.collapse(true);
	return endagain(range, cmd);
}

function endagain(range: RANGE, cmd: Replace) {
	mark(range);
	cmd.after = getEditor(range).contentNode.innerHTML || "";
	unmark(range);
	range.collapse();
	return range;
}

// function markText(range: Range) {
// 	let node = range.commonAncestorContainer;
// 	let text = node.textContent;
// 	let out = text.substring(0, range.startOffset) + CHAR.STX;
// 	out += text.substring(range.startOffset, range.endOffset);
// 	out += CHAR.ETX + text.substring(range.endOffset);
// 	node.textContent = out;
// 	console.log("mark:", out, range)
// }
// function unmarkText(range: Range) {
// 	let node = range.commonAncestorContainer;
// 	let text = node.textContent;
// 	let start = text.indexOf(CHAR.STX);
// 	let end = text.indexOf(CHAR.ETX);
// 	let out = text.substring(0, start);
// 	out += text.substring(start + 1, end);
// 	out += text.substring(end + 1);
// 	node.textContent = out;
// 	range.setStart(node, start);
// 	range.setEnd(node, end);

// 	console.log("unmark:", out, range)
// }

function positionToText(range: RANGE) {
	let inHeader = getHeader(getEditor(range).node, range.startContainer);
	narrowRange(range);
	if (range.collapsed) {
		let content = getEditor(range).contentNode;
		if (content.childNodes.length != 1) {
			//force single text node...
			content.textContent = content.textContent;
		}
		if (ele(range.commonAncestorContainer)) {
			range.selectNodeContents(content?.lastChild || content);
			range.collapse(inHeader ? true : false);	
		}
	}
}
