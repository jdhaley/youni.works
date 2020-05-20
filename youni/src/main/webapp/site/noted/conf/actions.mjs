export default {
	Save: {
		group: "File",
		title: "Save",
		shortcut: "Control+S",
		icon: "save.png",
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
	Heading: {
		group: "Outline",
		title: "Heading",
		icon: "heading.png",
		action: Heading
	},
	Promote: {
		group: "Outline",
		title: "Promote",
		shortcut: "Control+Backspace",
		icon: "outdent.gif",
		action: Promote
	},
	Demote: {
		group: "Outline",
		title: "Demote",
		shortcut: "Control+Space",
		icon: "indent.gif",
		action: Demote
	}
}

function Heading(on, event) {
	event.action = "";
	let range = event.owner.selection;
	let node = range.container;
	switch (getContainerType(node)) {
		case "heading":
			let h = getContainer(node, "heading");
			range.selectNodeContents(h);
			edit.call(this, "formatBlock", "P").collapse(true);
			break;
		case "paragraph":
			let p = getContainer(node, "paragraph");
			let level = getSectionLevel(p);
			edit.call(this, "formatBlock", "H" + level).collapse(true);
			break;
			event.action = "Join";
			break;
	}
}

function Promote(on, event) {
	event.action = "";
	let range = event.owner.selection;
	let node = range.container;
	switch (getContainerType(node)) {
		case "heading":
			let h = getContainer(node, "heading");
			let level = getHeadingLevel(h);
			if (level > 1) {
				let range = this.owner.selection;
				range.selectNodeContents(h);
				level--;
				edit.call(this, "formatBlock", "H" + level).collapse(true);
			}
			break;
		case "item":
		case "tag":
			let i = getContainer(node, "item");
			range.selectNodeContents(i);
			edit.call(this, "outdent").collapse(true);
			break;
		case "list":
			let l = getContainer(node, "list");
			range.setStartBefore(getContainer(range.startContainer, "item"));
			range.setEndAfter(getContainer(range.endContainer, "item"));
			break;
		default:
			event.action = "Join";
			break;
	}
}
function Demote(on, event) {
	event.action = "";
	let range = event.owner.selection;
	let node = range.container;
	switch (getContainerType(node)) {
		case "heading":
			let h = getContainer(node, "heading");
			let level = getHeadingLevel(h);
			if (level < 6) {
				let range = this.owner.selection;
				range.selectNodeContents(h);
				level++;
				edit.call(this, "formatBlock", "H" + level).collapse(true);
			}
			break;
		case "item":
		case "tag":
			let i = getContainer(node, "item");
			range.selectNodeContents(i);
			edit.call(this, "indent").collapse(true);
			break;
		case "list":
			let l = getContainer(node, "list");
			range.setStartBefore(getContainer(range.startContainer, "item"));
			range.setEndAfter(getContainer(range.endContainer, "item"));
			edit.call(this, "indent");
			break;
		case "article":
			edit.call(this, "insertUnorderedList");
			break;
	}
}
function edit(command, argument) {
	try {
		this.owner.window.document.execCommand(command, false, argument || "");
		return this.owner.selection;
	} catch (error) {
		console.error("Command error", command, argument);
		throw error;
	}
}

function getHeadingLevel(node) {
	let name = node.nodeName;
	if (name && name.length == 2 && name.charAt(0) == "H") {
		let level = "123456".indexOf(name.charAt(1))
		if (level >= 0) return level + 1;
	}
	return 0;
}

function getSectionLevel(node) {
	let level = getHeadingLevel(node);
	if (level) return level - 1;
	for (; node; node = node.previousNode) {
		level = getHeadingLevel(node);
		if (level) return level;
	}
	return -1;
}
function getContainerType(node) {
	while (node) {
		let type = typeOf(node);
		if (type) return type;
		node = node.parentNode;
	}
}

function getContainer(node, type) {
	while (node) {
		if (typeOf(node) == type) return node;
		node = node.parentNode;
	}
}
function typeOf(node) {
	switch (node.nodeName) {
		case "ARTICLE":
			return "article";
		case "UL":
		case "OL":
			return "list";
		case "LI":
			return "item";
		case "A":
		case "B":
		case "I":
		case "U":
		case "Q":
		case "EM":
		case "STRONG":
			return "tag";
		case "P":
			return "paragraph";
	}
	if (getHeadingLevel(node)) return "heading";
}
