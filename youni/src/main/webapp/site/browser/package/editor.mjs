export default {
	package$: "youni.works/editor",
	package$ui: "youni.works/ui",
	package$cmd: "youni.works/cmd",
	Frame: {
		super$: "ui.Frame",
		after$initializePlatform: function(conf) {
			let doc = this.window.document;
			this.sense.selection(doc, "SelectionChange");
			doc.execCommand("styleWithCSS", true);
			doc.execCommand("defaultParagraphSeparator", "BR");
		},
		activate: function() {
			let control = this.part.Editor.createView();
			this.content.append(control);
			let location = this.window.location;
			if (location.search) {
				this.window.document.title = location.search.substring(location.search.lastIndexOf("/") + 1);
				this.service.get.service(this, "load", location.search.substring(1) + ".view");
			}
			this.lastCommand = this.sys.extend();
		}
	},
	Editor: {
		super$: "ui.Viewer",
		after$initialize: function(conf) {
			let actions = conf.actions;
			for (let name in actions) {
				conf = actions[name];
				this.action[name] = conf.action;
				if (conf.shortcut) this.shortcut[conf.shortcut] = name;
				//we don't have a view so we can't create buttons yet.
			}
			this.actions = actions;
		},
//		part: {
//			type$ribbon: "ui.Viewer",
//			type$body: "ui.Viewer"
//		},
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
			view.body.focus();	

		},
		drawRibbon: function(view) {
			view.ribbon = this.part.ribbon.createView();
			let markup = "";
			for (let name in this.actions) {
				let conf = this.actions[name];
				if (conf.icon) {
					let title = conf.title;
					if (conf.shortcut) title += "\n" + conf.shortcut;
					markup += `<button title='${title}' data-command='${name}'><img src='conf/icons/${conf.icon}'></img></button>`;
				}
			}
			view.ribbon.innerHTML = markup;
			view.append(view.ribbon);
		},
		drawBody: function(view) {
			view.body = this.part.body.createView(view.model);
			view.body.model = view.model;
			view.body.contentEditable = true;
			view.body.tabIndex = 1;
//			view.caret = this.owner.createView("blink");
			view.append(view.body);
		},
		extend$action: {
			load: function(message) {
				let model = "";
				switch (message.content.status) {
					case 200:
						model = this.owner.createView("div");
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
			KeyDown: function(event) {
				event.device = this.owner.device.keyboard;
				event.action = this.getShortcut(event) || this.getAction(event);
			},
			Click: function(event) {
				console.log("click");
				let action = event.target.parentNode.dataset.command;
				if (action) event.action = action;
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
			Promote: DEFAULT,
			Demote: DEFAULT,
			Character: DEFAULT,
		},
		getShortcut: function(event) {
			let shortcut = event.device.getShortcut(event);
			return this.shortcut[shortcut];
		},
		getAction: getAction
	},
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
