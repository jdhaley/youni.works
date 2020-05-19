export default {
	Save: {
		group: "File",
		title: "Save",
		shortcut: "Control+S",
		icon: "save.png",
		action: function(on, event) {
			event.action = ""; //Don't save locally.
			let file = this.owner.window.location.search.substring(1) + ".view";
			this.owner.service.save.service(this.owner, "saved", JSON.stringify({
				[file]: on.body.outerHTML
			}));
		}
	},
	Strong: {
		group: "Tag",
		title: "Strong",
		shortcut: "Control+B",
		icon: "bold.gif",
		action: function(on, event) {
			edit.call(this, "bold");
			event.action = "";
		}
	},
	Emphasis: {
		group: "Tag",
		title: "Emphasis",
		shortcut: "Control+I",
		icon: "italic.gif",
		action: function(on, event) {
			edit.call(this, "italic");
			event.action = "";
		}
	},
	Term: {
		group: "Tag",
		title: "Term",
		shortcut: "Control+U",
		icon: "underline.gif",
		action: function(on, event) {
			edit.call(this, "underline");
			event.action = "";
		}
	},
	Heading: {
		group: "Outline",
		title: "Heading",
		icon: "heading.png",
		action: function(on, event) {
			edit.call(this, "formatBlock", "H1");
			event.action = "";
		}
	},
	Items: {
		group: "Outline",
		title: "Items",
		icon: "dottedlist.gif",
		action: function(on, event) {
			edit.call(this, "insertUnorderedList");
			event.action = "";
		}
	},
	List: {
		group: "Outline",
		title: "List",
		shortcut: "Control+L",
		icon: "numberedlist.gif",
		action: function(on, event) {
			edit.call(this, "insertOrderedList");
			event.action = "";
		}
	},
	Promote: {
		group: "Outline",
		title: "Promote",
		shortcut: "Control+Backspace",
		icon: "outdent.gif",
		action: function(on, event) {
			let node = event.owner.selection.container;
			let level = getHeadingLevel(node.nodeName);
			if (level > 1) {
				edit.call(this, "formatBlock", "H" + --level);
				event.action = "";
			} else if (node.nodeName == "LI") {
				edit.call(this, "outdent");
				event.action = "";
			} else {
				event.action = "Join";
			}
		}
	},
	Demote: {
		group: "Outline",
		title: "Demote",
		shortcut: "Control+Space",
		icon: "indent.gif",
		action: function(on, event) {
			let node = event.owner.selection.container;
			let level = getHeadingLevel(node.nodeName);
			if (level && level < 6) {
				edit.call(this, "formatBlock", "H" + ++level);
				event.action = "";
			} else if (node.nodeName == "LI") {
				edit.call(this, "indent");
				event.action = "";
			} else {
				edit.call(this, "insertUnorderedList");
				event.action = "";
			}
		}
	}
}

function edit(command, argument) {
	try {
		this.owner.window.document.execCommand(command, false, argument || "");   				
	} catch (error) {
		console.error("Command error", command, argument);
		throw error;
	}
}

function getHeadingLevel(name) {
	if (name.length == 2 && name.charAt(0) == "H") {
		let level = "123456".indexOf(name.charAt(1))
		if (level >= 0) return level + 1;
	}
	return 0;
}

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
