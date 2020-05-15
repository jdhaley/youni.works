export default {
	package$: "youniworks.com/editor",
	package$ui: "youniworks.com/ui",
	Frame: {
		super$: "ui.Frame",
		after$initializePlatform: function(conf) {
			//this.sense.selection(this.window.document, "SelectionChange");
			this.window.document.execCommand("styleWithCSS", true);
			this.window.document.execCommand("defaultParagraphSeparator", "BR");
		},
		activate: function() {
			let controller = this.part.Editor;
			let control = this.createView("main");
			this.content.append(control);
			controller.control(control);
			let location = this.window.location;
			if (location.search) {
				this.window.document.title = location.search.substring(location.search.lastIndexOf("/") + 1);
				this.service.get.service(this, "load", location.search.substring(1));
			}
		}
	},
	Editor: {
		super$: "ui.Viewer",
		draw: function(view) {
			view.ribbon = this.part.ribbon.createView(this.commands);
			view.append(view.ribbon);
			view.body = this.part.body.createView(view.model);
			view.body.model = view.model;
			view.body.contentEditable = true;
			view.append(view.body);
		},
		edit: function(command, argument) {
			try {
				this.owner.window.document.execCommand(command, false, argument || "");   				
			} catch (error) {
				console.error("Command error", command, argument);
				throw error;
			}
		},
		commands: {
		},
		after$control: function(view) {
			this.owner.sense.event(view, "Click");
			this.owner.sense.event(view, "KeyDown");
			this.owner.sense.event(view, "Input");
			this.owner.sense.event(view, "Cut");
			this.owner.sense.event(view, "Copy");
			this.owner.sense.event(view, "Paste");
		},
		shortcut: {
			"Control+S": "Save",
			"Control+B": "Bold",
			"Control+I": "Italic",
			"Control+U": "Underline",
			"Control+Backspace": "Promote",
			"Control+Space": "Demote",
			"Control+L": "OrderedList",
		},
		getType: function(node) {
			if (node.nodeType != Node.ELEMENT_NODE) return node.nodeName;
			if (this.getHeadingLevel) return "heading";
			switch (node.nodeName) {
				case "LI":
				case "P":
					return "item";
				case "UL":
				case "OL":
					return "list";
				case "B":
				case "I":
				case "U":
				case "EM":
				case "STRONG":
					return "tag";
			}
			return "";
		},
		getHeadingLevel: function(name) {
			if (name.length == 2 && name.charAt(0) == "H") {
				let level = "123456".indexOf(name.charAt(1))
				if (level >= 0) return level + 1;
			}
			return 0;
		},
		extend$action: {
			load: function(message) {
				let model = "";
				switch (message.content.status) {
					case 200:
						model = this.owner.createView();
						model.innerHTML = message.content.response;
						model = model.firstChild.innerHTML;
						break;
					case 404:
						model = "<h1>" + this.owner.window.document.title + " (New)</h1>";
						break;
					default:
						model = "<font color=red>" + message.content.response + "</font>";
						break;
				}
				message.on.model = model;
				message.action = "draw";
			},
			Save: function(event) {
				event.action = ""; //Don't save locally.
				let file = this.owner.window.location.search.substring(1);
				this.owner.service.save.service(this.owner, "saved", JSON.stringify({
					[file]: event.on.body.outerHTML
				}));
			},
			Click: function(event) {
				let action = event.target.parentNode.dataset.command;
				if (action) event.action = action;
			},
			KeyDown: function(event) {
				event.device = this.owner.device.keyboard;
				event.action = this.getShortcut(event) || this.getAction(event);
			},
			Input: DEFAULT,
			Cut: DEFAULT,
			Copy: DEFAULT,
			Paste: DEFAULT,
			Delete: DEFAULT,

			Insert: DEFAULT,
			Erase: DEFAULT,
			Split: DEFAULT,
			Join: DEFAULT,
			Character: function(event) {
				let range = event.owner.selection;
				if (range.collapsed && range.container.nodeName == "LI" && range.startOffset == 0) {
					if (event.key == ":") {
						range.selectNodeContents(range.container)
						let exist = range.container.innerHTML;
						if (exist == "" || exist == "<br>") exist = "\u200a";
						console.log(range.container.innerHTML);
						this.edit("insertHtml", "<dt class=term>name</dt>" + exist);
						range.selectNodeContents(range.container.firstChild);
						this.owner.selection = range;
						event.action = "";
						return;
					}
				}
			},
			Promote: function(event) {
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
			},
			Demote: function(event) {
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
			},
			UnorderedList: function(event) {
				this.edit("insertUnorderedList");
				event.action = "";
			},
			OrderedList: function(event) {
				this.edit("insertOrderedList");
				event.action = "";
			},
			Heading: function(event) {
				this.edit("formatBlock", "H1");
				event.action = "";
			},
			Bold: function(event) {
				this.edit("bold");
				event.action = "";
			},
			Italic: function(event) {
				this.edit("italic");
				event.action = "";
			},
			Underline: function(event) {
				this.edit("underline");
				event.action = "";
			},
		},
		getShortcut: function(event) {
			let shortcut = event.device.getShortcut(event);
			return this.shortcut[shortcut];
		},
		getAction: getAction
	},
	Ribbon: {
		super$: "ui.Viewer",
		draw: function(view) {
			let markup = "";
			for (let name in view.model) {
				let command = view.model[name];
				let title = command.title;
				if (command.shortcut) title += "\n" + command.shortcut;
				markup += `<button title='${title}' data-command='${name}'><img src='conf/icons/${command.icon}'></img></button>`;
			}
			view.innerHTML = markup;
		}
	}
}

function DEFAULT(event) {
	
}

function getAction(event) {
	const range = event.owner.selection;
	const isCollapsed = range && range.collapsed;
	switch (event.device.getKey(event)) {
		case "Insert":
			if (event.shiftKey) {
				/* Shift+Insert is an alternate binding to Paste, on Windows at least.
				 * We use this fact to event an alternate *trusted* paste.
				 */
				event.on.pasteSpecial = true;
				event.action = "DEFAULT";
				//////////////this.turn.end(event, "Default");
			} else {
				return "Insert";
			}
		case "Delete":
			if (isCollapsed) {
				return range.afterText ? "Erase" : "Join";
			}
			return "Delete";
		case "Backspace":
			event.back = true;
			if (range.collapsed && range.startContainer.nodeType === Node.TEXT_NODE && range.startOffset) return "Erase";
			return "Promote";
		case " ":
			if (range.collapsed && range.startContainer.nodeType === Node.TEXT_NODE && range.startOffset) return "Character";
			return "Demote";
		case "Enter":
			if (isCollapsed) {
				if (range.beforeText == "") return "Insert";
				if (range.afterText == "") {
					event.append = true;
					return "Insert";
				}
			}
			return "Split";
		default:
			return event.device.getCharacter(event) ? "Character" : "Press";
	}
}
