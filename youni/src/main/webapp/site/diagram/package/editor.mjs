export default {
	package$: "youni.works/diagram/editor",
	package$ui: "youni.works/ui",
	package$cmd: "youni.works/cmd",
	Frame: {
		super$: "ui.Frame",
		activate: function() {
			let control = this.part.Editor.createView();
			this.content.append(control);
			this.receive("draw");
			if (location.search) {
				this.window.document.title = location.search.substring(location.search.lastIndexOf("/") + 1);
				this.service.get.service(this, "load", location.search.substring(1) + ".view");
			}
		}
	},
	Editor: {
		super$: "ui.Viewer",
		after$initialize: function(conf) {
			let actions = conf.actions;
			let group = this.sys.extend();
			for (let name in actions) {
				conf = actions[name];
				this.action[name] = conf.action;
				if (conf.shortcut) this.shortcut[conf.shortcut] = name;
				if (conf.group) {
					if (!group[conf.group]) group[conf.group] = this.sys.extend();
					group[conf.group][name] = conf;
				}
				//we don't have a view so we can't create buttons yet.
			}
			this.group = group;
		},
		after$control: function(view) {
			view.sense("event", "KeyDown");
			view.sense("event", "MouseDown");
			view.sense("event", "MouseUp");
		},
		draw: function(view) {
			this.drawRibbon(view);
			this.drawBody(view);
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
		extend$action: {
			load: function(message) {
				message.on.model = "";
				switch (message.content.status) {
					case 200:
						message.on.model = message.content.response;
						message.action = "draw";
						break;
					case 404:
						message.action = "new";
						break;
					default:
						message.action = ""
						break;
				}
				message.on.model = message.content;
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
