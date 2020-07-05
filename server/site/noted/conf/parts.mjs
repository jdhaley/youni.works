export default {
	package$: "youni.works/noted/parts",
	use: {
		package$view: "youni.works/web/view",
		package$ui: "youni.works/web/ui"
	},
	public: {
		BODY: {
			type$: "use.view.Viewer",
			viewName: "body",
			viewType: "composite",
			part: {
				main: {
					type$: "use.ui.Application",
					part: {
						ribbon: {
							type$: "use.ui.Ribbon",
							viewName: "nav"
						},
						article: {
							type$: "use.ui.Article",
							viewName: "article"
						}
					},
					extend$shortcut: {
					},
					extend$action: {
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
					control: function(view) {
						this.super("control", view);
						view.sense("event", "Click");
						view.sense("event", "KeyDown");
						view.sense("event", "MouseUp");
						view.sense("event", "Input");
						view.sense("event", "Cut");
						view.sense("event", "Copy");
						view.sense("event", "Paste");
	//					view.ownerDocument.sense("selection", "SelectionChange");
					},
					initialize: function(conf) {
						this.super("initialize", conf);
						let doc = this.owner.content.ownerDocument;
						doc.execCommand("styleWithCSS", false, false);
						doc.execCommand("defaultParagraphSeparator", false, "P");
						//	sys.implement(this, cmd.Commander);
						//this.lastCommand = this.sys.extend();
					}
				}
			}
		}
	}
}

function DEFAULT(event) {
}

function getAction(event) {
	const range = event.target.owner.selection;
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
