export default {
	package$: "youni.works/noted",
	package$ui: "youni.works/ui",
	package$editor: "youni.works/editor",
	public: {
		Editor: {
			type$: "editor.Editor",
			controlName: "main",
			part: {
				ribbon: {
					type$: "ui.Viewer",
					controlName: "nav",
					draw: function() {
						//TODO the default viewer draws on a model.  The ribbon isn't a model view but a component.
					}
				},
				body: {
					type$: "ui.Viewer",
					controlName: "article"
				}
			},
			extend$shortcut: {
			},
			extend$action: {
			}
		}
			/*
			extend$shortcut: {
				"Control+S": "Save",
				"Control+B": "Bold",
				"Control+I": "Italic",
				"Control+U": "Underline",
				"Control+Backspace": "Promote",
				"Control+Space": "Demote",
				"Control+L": "OrderedList",
//				"Control+Z": "Undo",
//				"Control+Y": "Redo"
			},
			extend$action: {
//				MouseDown: function(event) {
//					let caret = event.on.caret;
//					caret.style.width = "0px";				
//				},
//				MouseUp: function(event) {
//					checkCaret(event);
//				},
//				SelectionChange: function(event) {
//				checkCaret(event);
//			},
//				Undo: function(event) {
//					this.owner.undo();
//				},
//				Redo: function(event) {
//					this.owner.redo();
//				},
//				Character: function(event) {				
//					let range = event.owner.selection;
//					if (range.collapsed) {
//						replace.call(this, event, event.device.getCharacter(event));
//					} else {
//						replace.call(this, event, event.device.getCharacter(event));
//					}
//					range.collapse();
//					this.owner.selection = range;
//					event.action = "";
//				},
			},
//			command: {
//				type$Edit: "editor.Edit"
//			},
		}
		*/
	}
}

//Edit: {
//	super$: "cmd.Command",
//	var$prior: null,
//	var$next: null,
//	var$owner: null,
//	var$before: null,
//	var$after: null,
//	undo: function() {
//		let range = this.owner.selection;
//		range.position = this.after;
//		doreplace.call(range, this.before.markup);
//	},
//	redo: function() {
//		let range = this.owner.selection;
//		range.position = this.before;
//		doreplace.call(range, this.after.markup);
//	}
//},
//edit: function(command, argument) {
//try {
//	this.owner.window.document.execCommand(command, false, argument || "");   				
//} catch (error) {
//	console.error("Command error", command, argument);
//	throw error;
//}
//},
//getType: function(node) {
//if (node.nodeType != Node.ELEMENT_NODE) return node.nodeName;
//if (this.getHeadingLevel) return "heading";
//switch (node.nodeName) {
//	case "UL":
//	case "OL":
//		return "list";
//	case "LI":
//		return "item";
//	case "A":
//	case "B":
//	case "I":
//	case "U":
//	case "Q":
//	case "EM":
//	case "STRONG":
//		return "tag";
//}
//return "";
//},
//getHeadingLevel: function(name) {
//if (name.length == 2 && name.charAt(0) == "H") {
//	let level = "123456".indexOf(name.charAt(1))
//	if (level >= 0) return level + 1;
//}
//return 0;
//},

function checkCaret(event) {
let range = event.owner.selection;
let caret = event.on.caret;
if (range.collapsed) {
	if (!caret.parentNode) event.on.body.append(caret);
	let rect = range.getBoundingClientRect();
	caret.style.top = rect.top - event.on.body.getBoundingClientRect().top + "px";
	caret.style.left = rect.left + "px";
	caret.style.height = rect.height + "px";
	caret.style.width = "1px";
} else {
	caret.style.width = "0px";									
}
}
function replace(event, markup) {
let range = event.owner.selection;
let command = this.sys.extend(this.command.Edit);
command.owner = this.owner;
command.before = range.position;
command.before.markup = range.markupContent;

doreplace.call(range, markup);

command.after = range.position;
command.after.markup = range.markupContent;
this.owner.addCommand(command);
}
function doreplace(markup) {
let startText = 0;
if (this.startContainer.nodeType == Node.TEXT_NODE) {
	startText = this.startOffset
	markup = this.startContainer.textContent.substring(0, startText) + markup;
	this.setStartBefore(this.startContainer);
	if (this.startContainer.nodeType != Node.ELEMENT_NODE) throw new Error("Replace Error");
}
let endText = 0;
if (this.endContainer.nodeType == Node.TEXT_NODE) {
	endText = this.endContainer.textContent.length - this.endOffset;
	markup += this.endContainer.textContent.substring(this.endOffset);
	this.setEndAfter(this.endContainer);
	if (this.endContainer.nodeType != Node.ELEMENT_NODE) throw new Error("Replace Error");
}
let save = this.cloneRange();
this.deleteContents();
//
let frag = this.owner.createView();
let nodes = this.owner.createView("div");
nodes.innerHTML = markup;
nodes = nodes.childNodes;
for (let i = 0; i < nodes.length; i++) frag.append(nodes[i]);
this.insertNode(frag);
//
if (startText) {
	let start = save.startContainer.childNodes[save.startOffset];
	if (start.nodeType != Node.TEXT_NODE) throw new Error("Replace Error")
	this.setStart(start, startText);
} else {
	this.setStart(save.startContainer, save.startOffset);
}
if (endText) {
	let end = save.endContainer.childNodes[save.endOffset];
	if (end.nodeType != Node.TEXT_NODE) throw new Error("Replace Error")
	this.setEnd(end, end.textContent.length - endText);
} else {
	this.setEnd(save.endContainer, save.endOffset);
}
}

