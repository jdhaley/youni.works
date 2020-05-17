export default {
	Save: {
		title: "Save",
		shortcut: "Control+S",
		icon: "save.png",
		action: function(event) {
			event.action = ""; //Don't save locally.
			let file = this.owner.window.location.search.substring(1) + ".view";
			this.owner.service.save.service(this.owner, "saved", JSON.stringify({
				[file]: event.on.body.outerHTML
			}));
		}
	},
	Strong: {
		title: "Strong",
		shortcut: "Control+B",
		icon: "bold.gif",
		action: function(event) {
			this.edit("bold");
			event.action = "";
		}
	},
	Emphasis: {
		title: "Emphasis",
		shortcut: "Control+I",
		icon: "italic.gif",
		action: function(event) {
			this.edit("italic");
			event.action = "";
		}
	},
	Term: {
		title: "Term",
		shortcut: "Control+U",
		icon: "underline.gif",
		action: function(event) {
			this.edit("underline");
			event.action = "";
		}
	},
	Heading: {
		title: "Heading",
		icon: "heading.png",
		action: function(event) {
			this.edit("formatBlock", "H1");
			event.action = "";
		}
	},
	Items: {
		title: "Items",
		icon: "dottedlist.gif",
		action: function(event) {
			this.edit("insertUnorderedList");
			event.action = "";
		}
	},
	List: {
		title: "List",
		shortcut: "Control+L",
		icon: "numberedlist.gif",
		action: function(event) {
			this.edit("insertOrderedList");
			event.action = "";
		}
	},
	Promote: {
		title: "Promote",
		shortcut: "Control+Backspace",
		icon: "outdent.gif",
		action: function(event) {
			let node = event.owner.selection.container;
			let level = this.getHeadingLevel(node.nodeName);
			if (level > 1) {
				this.edit("formatBlock", "H" + --level);
				event.action = "";
			} else if (node.nodeName == "LI") {
				this.edit("outdent");
				event.action = "";
			} else {
				event.action = "Join";
			}
		}
	},
	Demote: {
		title: "Demote",
		shortcut: "Control+Space",
		icon: "indent.gif",
		action: function(event) {
			let node = event.owner.selection.container;
			let level = this.getHeadingLevel(node.nodeName);
			if (level && level < 6) {
				this.edit("formatBlock", "H" + ++level);
				event.action = "";
			} else if (node.nodeName == "LI") {
				this.edit("indent");
				event.action = "";
			} else {
				this.edit("insertUnorderedList");
				event.action = "";
			}
		}
	}
}