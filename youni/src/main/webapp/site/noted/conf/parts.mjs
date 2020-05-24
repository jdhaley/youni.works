export default {
	package$: "youni.works/noted/parts",
	use: {
		package$ui: "youni.works/web/ui"
	},
	public: {
		main: {
			type$: "use.ui.Main",
			part: {
				ribbon: {
					type$: "use.ui.Ribbon",
				},
				body: {
					type$: "use.ui.Article",
				}
			},
			extend$shortcut: {
			},
			extend$instruction: {
				Input: DEFAULT,
				Cut: DEFAULT,
				Copy: DEFAULT,
				Paste: DEFAULT,
				Delete: DEFAULT,
				Insert: DEFAULT,
				Erase: DEFAULT,
				Split: DEFAULT,
				Join: DEFAULT,
				Promote: DEFAULT,
				Demote: DEFAULT,
				Character: DEFAULT,
			},
			getAction: getAction,
			after$control: function(view) {
				view.sense("event", "Click");
				view.sense("event", "KeyDown");
				view.sense("event", "MouseUp");
				view.sense("event", "Input");
				view.sense("event", "Cut");
				view.sense("event", "Copy");
				view.sense("event", "Paste");
				view.ownerDocument.sense("selection", "SelectionChange");
			},
			after$initialize: function(conf) {
				let doc = this.owner.window.document;
				doc.execCommand("styleWithCSS", false, false);
				doc.execCommand("defaultParagraphSeparator", false, "P");
				//	sys.implement(this, cmd.Commander);
				//this.lastCommand = this.sys.extend();
			}
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
				//////////////on.pasteSpecial = true;
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
			if (range.startContainer.nodeType === Node.TEXT_NODE && range.startOffset) return "Erase";
			return "Promote";
		case " ":
			if (range.startContainer.nodeType === Node.TEXT_NODE && range.startOffset) return "Character";
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
