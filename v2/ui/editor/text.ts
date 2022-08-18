import {CHAR} from "../../base/util.js";

import {Edit} from "./editor.js";
import {getContent, getEditableView, getHeader, mark, narrowRange, unmark} from "./util.js";

export default function edit(commandName: string, range: Range, content: string) {
	positionToText(range);
	let cmd = COMMANDS[commandName];
	if (!cmd) throw new Error("Unrecognized command");
	return cmd.call(this, commandName, range, content);
}

const COMMANDS = {
	"Cut": doit,
	"Paste": doit,
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
function doit(commandName: string, range: Range, text: string): Range {
	let node = range.commonAncestorContainer;
	let view = getEditableView(node);

	if (view?.$controller.model != "text") {
		console.error("Invalid range for edit.");
	}
	if (range.collapsed && commandName == "Erase") {
		if (!range.startOffset) return range;
	}

	if (range.collapsed && node == lastEdit.node) {
		let cmd = this.owner.commands.peek() as Edit;
		if (cmd?.name == commandName && view?.id == cmd.viewId) {
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

	let cmd = new Edit(this.owner, commandName, view.id);
	doReplace(cmd, range, text);
	range.collapse();
	return range;
}

function doReplace(cmd: Edit, range: Range, text: string) {
	mark(range);
	let content = getContent(range);
	if (!content) return;
	cmd.before = content.innerHTML;	
	range.deleteContents();
	if (text) {
		let ins = content.ownerDocument.createTextNode(text);
		range.insertNode(ins);
	}
	cmd.after = content.innerHTML;
	return unmark(range);
}


function doAgain(cmd: Edit, range: Range, text: string) {
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

function editAgain(range: Range, cmd: Edit, char: string) {
	let node = range.commonAncestorContainer;
	let text = node.textContent;
	text = text.substring(0, lastEdit.end) + char + text.substring(lastEdit.end);
	node.textContent = text;
	range.setStart(node, lastEdit.start);
	range.setEnd(node, ++lastEdit.end);

	return endagain(range, cmd);
}

function deleteAgain(range: Range, cmd: Edit, char: string) {
	let node = range.commonAncestorContainer;
	let text = node.textContent;
	text = text.substring(0, lastEdit.start) + text.substring(lastEdit.start + 1);
	node.textContent = text;
	range.setStart(node, lastEdit.start);
	range.collapse(true);
	return endagain(range, cmd);
}

function eraseAgain(range: Range, cmd: Edit) {
	let node = range.commonAncestorContainer;
	let text = node.textContent;
	text = text.substring(0, lastEdit.start - 1) + text.substring(lastEdit.start);
	node.textContent = text;

	range.setStart(node, --lastEdit.start);
	range.collapse(true);
	return endagain(range, cmd);
}

function endagain(range: Range, cmd: Edit) {
	mark(range);
	cmd.after = getContent(range).innerHTML || "";
	unmark(range);
	range.collapse();
	return range;
}

function markText(range: Range) {
	let node = range.commonAncestorContainer;
	let text = node.textContent;
	let out = text.substring(0, range.startOffset) + CHAR.STX;
	out += text.substring(range.startOffset, range.endOffset);
	out += CHAR.ETX + text.substring(range.endOffset);
	node.textContent = out;
	console.log("mark:", out, range)
}
function unmarkText(range: Range) {
	let node = range.commonAncestorContainer;
	let text = node.textContent;
	let start = text.indexOf(CHAR.STX);
	let end = text.indexOf(CHAR.ETX);
	let out = text.substring(0, start);
	out += text.substring(start + 1, end);
	out += text.substring(end + 1);
	node.textContent = out;
	range.setStart(node, start);
	range.setEnd(node, end);

	console.log("unmark:", out, range)
}

function positionToText(range: Range) {
	let inHeader = getHeader(getEditableView(range), range.startContainer);
	narrowRange(range);
	if (range.collapsed) {
		let content = getContent(range);
		if (content.childNodes.length != 1) {
			//force single text node...
			content.textContent = content.textContent;
		}
		if (range.commonAncestorContainer.nodeType != Node.TEXT_NODE) {
			range.selectNodeContents(content.lastChild);
			range.collapse(inHeader ? true : false);	
		}
	}
}
