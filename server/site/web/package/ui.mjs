export default {
	package$: "youni.works/web/ui",
	use: {
		package$view: "youni.works/web/view"
	},
	Main: {
		super$: "use.view.Viewer",
		viewName: "main",
		viewType: "composite",
		var$group: {
		},
		initialize: function(conf) {
			this.super("initialize", conf);
			for (let name in conf.actions) this.initializeInstruction(name, conf.actions[name]);
		},
		initializeInstruction: function(name, conf) {
			if (conf.group) {
				for (let group of conf.group.split()) {
					if (!this.group[group]) this.group[group] = this.sys.extend();
					this.group[group][name] = conf;					
				}
			}
			if (conf.instruction) {
				this.action[name] = conf.instruction;
			} else if (!this.action[name]) {
				this.log.warn(`Main viewer: Instruction "${name}" is not handled.`);
			}
			if (conf.shortcut) {
				this.shortcut[conf.shortcut] = name;
			}
		},
		getShortcut: function(event) {
			let shortcut = event.device.getShortcut(event);
			return this.shortcut[shortcut];
		},
		getAction: function(event) {
			return event.device.getCharacter(event) ? "Character" : event.device.getKey(event);
		},
		extend$action: {
			open: function(on, message) {
				let location = this.owner.window.location;
				if (location.search) {
					this.owner.window.document.title = location.search.substring(location.search.lastIndexOf("/") + 1);
					this.owner.service.open.service(this.owner, "load", {
						url: this.owner.window.location.search + ".view",
					});
				}
			},
			load: function(on, message) {
				let view = on.parts.article;
				if (message.status == 200) {
					let content = this.owner.view("div");
					content.innerHTML = message.content;
					view.innerHTML = content.firstChild.innerHTML;
				} else if (message.status == 204) {
					view.innerHTML = "<h1>" + this.owner.window.document.title + "</h1>";
					this.owner.window.document.title += " (New)";
				} else {
					let level = message.status >= 400 ? "Error" : "Note";
					let color = message.status >= 400 ? "red" : "blue";
					view.innerHTML = `<h1>${level}</h1><font color=${color}>${message.content}</font>`;
				}
			},
			saved: function(on, event) {
				let title = this.owner.window.document.title;
				if (title.endsWith(" (New)")) {
					title = title.substring(0, title.indexOf(" (New)"));
					this.owner.window.document.title = title;
				}
			},
			Save: function(on, event) {
				event.action = ""; //Stop Control+S to save on client.
				this.owner.service.save.service(this.owner, "saved", {
					url: this.owner.window.location.search + ".view",
					content: on.parts.article.outerHTML
				});
			},
			KeyDown: function(on, event) {
				event.device = this.owner.device.keyboard;
				event.action = this.getShortcut(event) || this.getAction(event);
			},
			Click: function(on, event) {
				//move to & use devices, etc... ribbon actions need a controller.
				//click is on the button img, parentNode is the button...
				let action = event.target.parentNode.dataset.command;
				if (action) event.action = action;
			}
		}		
	},
	Ribbon: {
		super$: "use.view.Viewer",
		viewName: "nav",
		extend$action: {
			draw: function(on) {
				let markup = "";
				for (let groupName in this.partOf.group) {
					let group = this.partOf.group[groupName];
					markup += `<menu title='${groupName}'>`
					for (let name in group) {
						let action = group[name];
						if (action.icon) {
							let title = action.title;
							if (action.shortcut) title += "\n" + action.shortcut;
							markup += `<button title='${title}' data-command='${name}'>${action.icon}</button>`;
						}
					}
					markup += "</menu>";
				}
				on.innerHTML = markup;
				on.parentNode.ribbon = on;
			}			
		}
	},
	Article: {
		super$: "use.view.Viewer",
		viewName: "article",
		control: function(view) {
			this.super("control", view);
			view.contentEditable = true;
			view.tabIndex = 1;
		}
	}
}
