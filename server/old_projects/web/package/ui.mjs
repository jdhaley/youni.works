export default {
	package$: "youni.works/web/ui",
	use: {
		package$control: "youni.works/base/control",
		package$view: "youni.works/web/view"
	},
	Frame: {
		super$: "use.view.Owner",
		device: {
		},
		sensor: {
		},
		control: function(view) {
			let viewer = this.part[view.dataset.view] || this.part[view.nodeName.toUpperCase()];
			viewer && viewer.control(view);
		},
		initialize: function(conf) {
			conf.window.document.owner = this;
			this.sys.define(this, "content", conf.window.document.body);
			this.sys.implement(conf.window.Element.prototype, conf.platform.view);
			this.sys.implement(conf.window.Range.prototype, conf.platform.range);
			this.super("initialize", conf);
		},
		virtual$selection: function() {
			let window = this.content.ownerDocument.defaultView;
			let selection = window.getSelection();
			if (arguments.length) {
					selection.removeAllRanges();
					selection.addRange(arguments[0]);
					return;
			}
			if (selection && selection.rangeCount) {
				return selection.getRangeAt(0);
			} else {
				let range = window.document.createRange();
				range.collapse();
				return range;
			}
		}
	},
	Component: {
		super$: "use.view.Viewer",
		extend$action: {
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
		},
		getShortcut: function(event) {
			let shortcut = event.device.getShortcut(event);
			return this.shortcut[shortcut];
		},
		getAction: function(event) {
			return event.device.getCharacter(event) ? "Character" : event.device.getKey(event);
		}
	},
	Application: {
		super$: "Component",
		viewName: "main",
		viewType: "composite",
		type$fs: "use.control.FileService",
		extend$action: {
			activate: function(on, message) {
				let location = this.owner.location;
				if (location.search) {
					this.owner.title = location.search.substring(location.search.lastIndexOf("/") + 1);
					this.fs.open(location.search + this.part.article.media.extension, this.owner);
				}
			},
			opened: function(on, message) {
				if (message.status == 200) {
					message.action = "openExisting";
				} else if (message.status == 204) {
					message.action = "openNew";
				} else {
					message.action = "openError"
				}
			},
			saved: function(on, message) {
				let index = this.owner.title.indexOf(" (New)");
				if (index >= 0) {
					this.owner.title = this.owner.title.substring(0, index);
				}
			},
			openExisting: function(on, message) {
				let view = on.parts.article;
				let content = this.owner.create("div");
				content.innerHTML = message.content;
				view.innerHTML = content.firstChild.innerHTML;
			},
			openNew: function(on, message) {
				let view = on.parts.article;
				view.innerHTML = "<h1>" + this.owner.title + "</h1>";
				this.owner.title = this.owner.title + " (New)";
			},
			openError: function(on, message) {
				let level = message.status >= 400 ? "Error" : "Note";
				let color = message.status >= 400 ? "red" : "blue";
				let view = this.owner.view("article");
				view.innerHTML = `<h1>${level}</h1><font color=${color}>${message.content}</font>`;
				on.parts.article = view;
			}
		},
		after$initialize: function(conf) {
			this.sys.define(this, "fs", conf.packages.services.public.fs, "const");
		}
	},
	Ribbon: {
		super$: "use.view.Viewer",
		viewName: "nav",
		var$group: {
		},
		after$initialize: function(conf) {
			for (let name in conf.actions) this.initializeAction(name, conf.actions[name]);
		},
		initializeAction: function(name, action) {
			let component = this.partOf;

			if (action.group) {
				for (let group of action.group.split()) {
					if (!this.group[group]) this.group[group] = this.sys.extend();
					this.group[group][name] = action;					
				}
			}
			if (action.instruction) {
				component.action[name] = action.instruction;
			} else if (!this.action[name]) {
				this.log.warn(`Main viewer: Instruction "${name}" is not handled.`);
			}
			if (action.shortcut) {
				component.shortcut[action.shortcut] = name;
			}
		},
		extend$action: {
			draw: function(on) {
				let markup = "";
				for (let groupName in this.group) {
					let group = this.group[groupName];
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
			}			
		}
	},
	Article: {
		super$: "use.view.Viewer",
		viewName: "article",
		media: {
			type: "application/json",
			extension: ".view"
		},
		control: function(view) {
			this.super("control", view);
			view.contentEditable = true;
			view.tabIndex = 1;
		}
	}
}
