import {TextReplace} from "../commands/replace.js";
import {getContent, getEditableView, getHeader, mark, narrowRange, unmark} from "../util.js";
import { content } from "../../../base/model.js";
import { CHAR } from "../../../base/util.js";
import { Display } from "../../display/display.js";

export class TextEditor extends Display {
	contentType = "text";
	viewContent(model: content): void {
		this.draw();
		this.content.textContent = "" + model;
	}
	contentOf(range?: Range): content {
		let model = "";
		if (range && !range.intersectsNode(this.content)) return;
		for (let node of (this.content as Element).childNodes) {
			if (node == range?.startContainer) {
				model += node.textContent.substring(range.startOffset);
			} else if (node == range?.endContainer) {
				model += node.textContent.substring(0, range.endOffset);
			} else {
				model += node.textContent;
			}
		}
		model = model.replace(CHAR.ZWSP, "");
		model = model.replace(CHAR.NBSP, " ");
		model = model.trim();
		return model;			
	}
	edit(commandName: string, range: Range, content: string) {
		positionToText(range);
		let cmd = COMMANDS[commandName];
		if (!cmd) throw new Error("Unrecognized command");
		return cmd.call(this, commandName, range, content);
	}
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
function doit(commandName: string, range: Range, text: string): Range {
	let node = range.commonAncestorContainer;
	let view = getEditableView(node);

	if (range.collapsed && commandName == "Erase") {
		if (!range.startOffset) return range;
	}

	if (range.collapsed && node == lastEdit.node) {
		let cmd = this.owner.commands.peek() as TextReplace;
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

	return new TextReplace(this.owner, commandName, view.id).exec(range, text);
}


function doAgain(cmd: TextReplace, range: Range, text: string) {
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

function editAgain(range: Range, cmd: TextReplace, char: string) {
	let node = range.commonAncestorContainer;
	let text = node.textContent;
	text = text.substring(0, lastEdit.end) + char + text.substring(lastEdit.end);
	node.textContent = text;
	range.setStart(node, lastEdit.start);
	range.setEnd(node, ++lastEdit.end);

	return endagain(range, cmd);
}

function deleteAgain(range: Range, cmd: TextReplace, char: string) {
	let node = range.commonAncestorContainer;
	let text = node.textContent;
	text = text.substring(0, lastEdit.start) + text.substring(lastEdit.start + 1);
	node.textContent = text;
	range.setStart(node, lastEdit.start);
	range.collapse(true);
	return endagain(range, cmd);
}

function eraseAgain(range: Range, cmd: TextReplace) {
	let node = range.commonAncestorContainer;
	let text = node.textContent;
	text = text.substring(0, lastEdit.start - 1) + text.substring(lastEdit.start);
	node.textContent = text;

	range.setStart(node, --lastEdit.start);
	range.collapse(true);
	return endagain(range, cmd);
}

function endagain(range: Range, cmd: TextReplace) {
	mark(range);
	cmd.after = getContent(range).innerHTML || "";
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
			range.selectNodeContents(content?.lastChild || content);
			range.collapse(inHeader ? true : false);	
		}
	}
}
