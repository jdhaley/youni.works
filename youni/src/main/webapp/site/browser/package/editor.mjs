export default {
	package$: "youni.works/editor",
	package$ui: "youni.works/ui",
	Editor: {
		super$: "ui.Main",
		after$initialize: function(conf) {
			let doc = this.owner.window.document;
			this.owner.sense.selection(doc, "SelectionChange");
			doc.execCommand("styleWithCSS", true);
			doc.execCommand("defaultParagraphSeparator", "BR");
			//	sys.implement(this, cmd.Commander);
			//this.lastCommand = this.sys.extend();
		},
		after$control: function(view) {
			view.sense("event", "Click");
			view.sense("event", "KeyDown");
			view.sense("event", "MouseUp");
			view.sense("event", "Input");
			view.sense("event", "Cut");
			view.sense("event", "Copy");
			view.sense("event", "Paste");
		},
		draw: function(view) {
			this.drawRibbon(view);
			this.drawBody(view);
			//view.caret = this.owner.createView("blink");
			view.body.focus();	
		},
		drawRibbon: function(view) {
			view.ribbon = this.part.ribbon.createView();
			let markup = "";
			for (let groupName in this.group) {
				let group = this.group[groupName];
				markup += `<div class='actions' title='${groupName}'>`
				for (let name in group) {
					let action = group[name];
					if (action.icon) {
						let title = action.title;
						if (action.shortcut) title += "\n" + action.shortcut;
						markup += `<button title='${title}' data-command='${name}'><img src='conf/icons/${action.icon}'></img></button>`;
					}
				}
				markup += "</div>";
			}
			view.ribbon.innerHTML = markup;
			view.append(view.ribbon);
		},
		drawBody: function(view) {
			view.body = this.part.body.createView(view.model);
			view.body.model = view.model;
			view.body.contentEditable = true;
			view.body.tabIndex = 1;
			view.append(view.body);
		},
		getAction: getAction,
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
