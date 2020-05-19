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
				[file]: event.on.body.outerHTML
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
			let type = getContainerType(node);
			switch (type) {
				case "heading":
					node = getContainer(node, "heading")
					this.owner.selection.selectNode(node);
					edit.call(this, "formatBlock", "H" + (getHeadingLevel(node) - 1));
					break;
				case "list":
				case "item":
					promote.call(this, node);
					break;
			}
			event.action = "";				
			//				event.action = "Join";
		}
	},
	Demote: {
		group: "Outline",
		title: "Demote",
		shortcut: "Control+Space",
		icon: "indent.gif",
		action: function(on, event) {
			let node = event.owner.selection.container;
			let type = getContainerType(node);
			switch (type) {
				case "heading":
					node = getContainer(node, "heading")
					this.owner.selection.selectNode(node);
					edit.call(this, "formatBlock", "H" + (getHeadingLevel(node) + 1));
					break;
				case "list":
				case "item":
					demote.call(this, node);
					break;
			}
			event.action = "";				
			//				event.action = "Join";
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

function getHeadingLevel(node) {
	let name = node.nodeName;
	if (name && name.length == 2 && name.charAt(0) == "H") {
		let level = "123456".indexOf(name.charAt(1))
		if (level >= 0) return level + 1;
	}
	return 0;
}

function getSection(node) {
	let level = getHeadingLevel(node);
	if (level) return level - 1;
	for (; node; node = node.parentNode) {
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
	}
	if (getHeadingLevel(node)) return "heading";
}

function selectItems(range) {
	if (typeOf(range.container) == "list") {
		range.setStartBefore(getContainer(range.startContainer, "item"));
		range.setEndAfter(getContainer(range.endContainer, "item"));
		return range;
	}
}

function promote(node) {
	let range = this.owner.selection;
	selectItems(range);
	if (typeOf(range.container) == "list") {
		let listType = range.container.nodeName;
		let markup = range.markupContent;
		if (range.startOffset) {
			let prior = range.container.childNodes[range.startOffset - 1];
			console.debug("add to ", prior.markup);
			markup = `<li>${prior.innerHTML}<${listType}>${markup}</${listType}></li>`;
			range.setStartBefore(prior);
			edit.call(this, "insertHTML", markup);
		}
	}
}

/*
	LI
	LI
		#text
		OL
			LI
			LI
	LI
	LI	
 */
function demote(node) {
	let range = selectItems(this.owner.selection);
	if (!range) return;
	let name = range.container.nodeName;
	let markup =  `<${name}>${range.markupContent}</${name}>`;
	let prior = range.container.childNodes[range.startOffset - 1];
	edit.call(this, "delete");
	range.selectNodeContents(prior);
	this.owner.selection = range;
	edit.call(this, "insertHTML", range.markupContent + markup);
}