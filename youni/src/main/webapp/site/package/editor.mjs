export default {
	package$: "youniworks.com/editor",
	package$ui: "youniworks.com/ui",
	Editable: {
		super$: "ui.Viewer",
		activate: function(view) {
			this.owner.sense.event(view, "MouseDown");
			this.owner.sense.event(view, "MouseUp");
			this.owner.sense.selection(view, "KeyDown");
			this.owner.sense.selection(view, "KeyUp");
			this.owner.sense.selection(view, "Input");
			this.owner.sense.selection(view, "Cut");
			this.owner.sense.selection(view, "Copy");
			this.owner.sense.selection(view, "Paste");
		},
		after$control: function(view) {
			this.activate(view);
			view.contentEditable = true;
		}
	},
	Editor: {
		super$: "ui.Viewer",
		isEnabled: true,
		shortcut: {
		},
		extend$action: {
			KeyDown: function(event) {
				event.device = this.owner.device.keyboard;
				event.action = "Press";
			},
			MouseDown: function(event) {
				event.device = this.owner.device.mouse;
				event.action = "Press";
			},
			KeyUp: function(event) {
				event.device = this.owner.device.keyboard;
				event.action = "Release";
			},
			MouseUp: function(event) {
				event.device = this.owner.device.mouse;
				event.action = "Release";
			},
			Press: function(event) {
				event.action = this.getShortcut(event) || this.getAction(event);
			},
			Input: DEFAULT,
			Character: DEFAULT,
			Insert: DEFAULT,
			Erase: DEFAULT,
			Cut: DEFAULT,
			Copy: DEFAULT,
			Paste: DEFAULT,
			Delete: DEFAULT,

			Split: DEFAULT,
			Join: DEFAULT,
			Promote: DEFAULT,
			Demote: DEFAULT,
//			Previous: function(event) {
//				let node = backward.call(event.on, isEditable)
//			},
//			Next: function(event) {
//				let node = forward.call(event.on, isEditable)				
//			}
		},
		getShortcut: function(event) {
			let shortcut = event.device.getShortcut(event);
			return this.shortcut[shortcut];
		},
		getAction: getAction
	}
}

function DEFAULT(event) {
	
}

function getAction(event) {
	const range = event.range;
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
			return (event.ctrlKey || range.beforeText == "") ? "Promote"  : "Erase";
		case " ":
			return (event.ctrlKey || range.beforeText == "") ? "Demote"  : "Character";
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
			return event.character ? "Character" : "Press";
	}
}
