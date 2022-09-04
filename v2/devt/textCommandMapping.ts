// import { content } from "../base/model.js"; 
// import { bundle, CHAR } from "../base/util.js";

// import {Edit, Editor, Replace} from "../ui/editor/editor.js";
// import {getContent, getEditableView, getHeader, mark, narrowRange, unmark} from "../ui/editor/util.js";


// export default function edit(this: Editor, commandName: string, range: Range, content: string) {
// 	positionToText(range);
// 	let view = getEditableView(range);
// 	if (view.$controller.model != "text") console.warn("View is not a text:", view);

// 	let op = CMD_OPS[commandName];
// 	if (!op) throw new Error("Unrecognized command");
// 	return op(this, commandName, range, content);
// }

// type action = (editor: Editor, commandName: string, range: Range, content?: content) => Range;

// const CMD_OPS: bundle<action> = {
// 	"Cut": replaceText,
// 	"Paste": replaceText,
// 	"Replace": replaceText,
// 	"Entry": (editor: Editor, commandName: string, range: Range, content: string): Range =>  {
// 		if (!range.collapsed) return replaceText(editor, commandName, range, content);
// 		return editText(editor, commandName, range, content);
// 	},
// 	"Erase": (editor: Editor, commandName: string, range: Range, content: string): Range =>  {
// 		if (!range.collapsed) return replaceText(editor, commandName, range, content);
// 		if (!range.startOffset) return;
// 		return editText(editor, commandName, range, content);
// 	},
// 	"Delete": (editor: Editor, commandName: string, range: Range, content: string): Range =>  {
// 		if (!range.collapsed) return replaceText(editor, commandName, range, content);
// 		let node = range.commonAncestorContainer;
// 		if (node.nodeType == Node.TEXT_NODE && node.textContent.length == range.endOffset) return;
// 		return editText(editor, commandName, range, content);
// 	},
// 	"Insert": noEdit,
// 	"Promote": noEdit,
// 	"Demote": noEdit,
// 	"Split": noEdit,
// 	"Join": noEdit,
// }

// function noEdit(editor: Editor, commandName: string, range: Range, content?: content): Range {
// 	return;
// }
// function replaceText(editor: Editor, commandName: string, range: Range, content: string) {
// 	lastEdit.node = null;
// 	return new ReplaceText(editor.owner, commandName, getEditableView(range).id).exec(range, content);
// }

// let lastEdit = {
// 	action: "",
// 	node: null,
// 	start: 0,
// 	end: 0
// }

// function editText(editor: Editor, commandName: string, range: Range, content: string) {
// 	if (!range.collapsed) throw new Error("edit text requires a collapsed range.");
// 	let node = range.commonAncestorContainer;
// 	let view = getEditableView(node);
// 	let result: Range;
// 	if (node == lastEdit.node) {
// 		let cmd = editor.owner.commands.peek() as Edit;
// 		if (cmd?.name == commandName && view?.id == cmd.viewId) {
// 			result = doAgain(cmd, range, content);
// 		}
// 	}
// 	lastEdit.node = node;
// 	return result || replaceText(editor, commandName, range, content);
// }

// class ReplaceText extends Replace {
// 	exec(range: Range, text: string): Range {
// 		mark(range);
// 		let content = getContent(range);
// 		if (!content) return;
// 		this.before = content.innerHTML;	
// 		range.deleteContents();
// 		if (text) {
// 			let ins = content.ownerDocument.createTextNode(text);
// 			range.insertNode(ins);
// 		}
// 		this.after = content.innerHTML;
// 		return unmark(range);
// 	}
// }

// function doAgain(cmd: Replace, range: Range, text: string) {
// 	let currentOffset = range.startOffset; //start & end are the same.
// 	switch (cmd.name) {
// 		case "Entry":
// 			if (currentOffset == lastEdit.end) {
// 				return editAgain(range, cmd,  text);
// 			}
// 			break;
// 		case "Delete":
// 			if (currentOffset == lastEdit.start) {
// 				return deleteAgain(range, cmd,  text);
// 			}
// 			break;
// 		case "Erase":
// 			if (currentOffset == lastEdit.start) {
// 				return eraseAgain(range, cmd);
// 			}
// 			break;
// 	}
// }

// function editAgain(range: Range, cmd: Replace, char: string) {
// 	let node = range.commonAncestorContainer;
// 	let text = node.textContent;
// 	text = text.substring(0, lastEdit.end) + char + text.substring(lastEdit.end);
// 	node.textContent = text;
// 	range.setStart(node, lastEdit.start);
// 	range.setEnd(node, ++lastEdit.end);

// 	return endagain(range, cmd);
// }

// function deleteAgain(range: Range, cmd: Replace, char: string) {
// 	let node = range.commonAncestorContainer;
// 	let text = node.textContent;
// 	text = text.substring(0, lastEdit.start) + text.substring(lastEdit.start + 1);
// 	node.textContent = text;
// 	range.setStart(node, lastEdit.start);
// 	range.collapse(true);
// 	return endagain(range, cmd);
// }

// function eraseAgain(range: Range, cmd: Replace) {
// 	let node = range.commonAncestorContainer;
// 	let text = node.textContent;
// 	text = text.substring(0, lastEdit.start - 1) + text.substring(lastEdit.start);
// 	node.textContent = text;

// 	range.setStart(node, --lastEdit.start);
// 	range.collapse(true);
// 	return endagain(range, cmd);
// }

// function endagain(range: Range, cmd: Replace) {
// 	mark(range);
// 	cmd.after = getContent(range).innerHTML || "";
// 	unmark(range);
// 	range.collapse();
// 	return range;
// }

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

// function positionToText(range: Range) {
// 	let inHeader = getHeader(getEditableView(range), range.startContainer);
// 	narrowRange(range);
// 	if (range.collapsed) {
// 		let content = getContent(range);
// 		if (content.childNodes.length != 1) {
// 			//force single text node...
// 			content.textContent = content.textContent;
// 		}
// 		if (range.commonAncestorContainer.nodeType != Node.TEXT_NODE) {
// 			range.selectNodeContents(content.lastChild);
// 			range.collapse(inHeader ? true : false);	
// 		}
// 	}
// }
