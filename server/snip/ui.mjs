export default {
	package$: "youni.works/web/ui",
	use: {
		package$signal: "youni.works/base/signal",
		package$part: "youni.works/base/part",
		package$platform: "youni.works/web/platform"
	},
	Frame: {
		super$: "use.signal.Receiver",
		type$controller: "use.platform.Sensor",
		"@iterator": function* iterate() {
			for (let name in this.part) yield this.part[name];
		},
		log: console,
		window: null,
		var$device: {
		},
		var$viewer: {
		},
		//TODO rename to view.
		get$content: function() {
			return this.window.document.body;
		},
		virtual$selection: function() {
			let selection = this.window.getSelection();
			if (arguments.length) {
					selection.removeAllRanges();
					selection.addRange(arguments[0]);
					return;
			}
			if (selection && selection.rangeCount) {
				return selection.getRangeAt(0);
			} else {
				let range = this.window.document.createRange();
				range.collapse();
				return range;
			}
		},
		createView: function(name) {
			let doc = this.window.document;
			return arguments.length ? doc.createElement("" + name) : doc.createDocumentFragment();
		},
		before$initialize: function(conf) {
			this.part.main.owner = this;
			this.window.document.owner = this;
			this.initializePlatform(conf);
			createStyleSheet(this);
		},
		initializePlatform: function(conf) {
			this.sys.implement(this.window.Node.prototype, conf.platform.node);
			this.sys.implement(this.window.Range.prototype, conf.platform.range);
			this.device = this.sys.extend(null, conf.platform.devices);
		},
		activate: function() {
			let main = this.part.main;
			if (!main) this.log.error("No main Viewer");
			this.content.append(main.createView());
			let message = this.sys.extend();
			message.action = "open";
			this.receive(message);
		}
	},
	Viewer: {
		super$: "use.part.Component",
		controlName: "div",
		view: "text",
		get$render: function() {
			return this.of && this.of.render;
		},
		extend$shortcut: {
		},
		extend$instruction: {
			draw: function(on, signal) {
				this.draw(on, this.view);
			}
		},
		createView: function(model) {
			let view = this.owner.createView(this.controlName);
			view.model = model;
			this.control(view);
			return view;
		},
		control: function(control) {
			if (control.controller == this) return;
			control.controller = this;
			if (this.name) control.dataset.view = "I" + this.id;
			if (this.classes) control.className = this.classes;
		},
		draw: function(view, render) {
			render = this.render[render];
			render && render.call(this, view);
		},
		after$initialize: function(conf) {
			this.owner.viewer["I" + this.id] = this;
			if (this.style) this.style = defineRule(this, conf);
		}
	},
	Main: {
		super$: "Viewer",
		view: "composite",
		controlName: "main",
		var$render: {
		},
		var$group: {
		},
		after$initialize: function(conf) {
			this.render = conf.platform.renders;
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
				this.instruction[name] = conf.instruction;
			} else if (!this.instruction[name]) {
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
		extend$instruction: {
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
				if (message.status == 200) {
					let model = this.owner.createView("div");
					model.innerHTML = message.content;
					model = model.firstChild.innerHTML;
					on.model = model;
					message.action = "draw";
				} else if (message.status == 204) {
					on.model = "<h1>" + this.owner.window.document.title + "</h1>";
					this.owner.window.document.title += " (New)";
					message.action = "draw";
				} else {
					message.action = "altStatus";
				}
			},
			altStatus: function(on, message) {
				let level = message.status >= 400 ? "Error" : "Note";
				let color = message.status >= 400 ? "red" : "blue";
				on.model = `<h1>${level}</h1><font color=${color}>${message.content}</font>`;
				message.action = "draw";
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
					content: on.parts.body.outerHTML
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
		super$: "Viewer",
		controlName: "nav",
		extend$instruction: {
			draw: function(on) {
				let markup = "";
				for (let groupName in this.of.group) {
					let group = this.of.group[groupName];
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
		super$: "Viewer",
		controlName: "article",
		view: "markup",
		after$control: function(view) {
			view.contentEditable = true;
			view.tabIndex = 1;
		}
	}
//	Action: {
//		super$: "Part"
//	}
}

function createStyleSheet(owner) {
	let ele = owner.window.document.createElement("style");
	ele.type = "text/css";
	owner.window.document.head.appendChild(ele);
	owner.sheet = ele.sheet;
}

function defineRule(viewer) {
	let out = `[data-view=I${viewer.id}] {`;
	for (let name in viewer.style) {
		out += name + ":" + viewer.style[name] + ";"
	}
	out += "}";
	let index = viewer.owner.sheet.insertRule(out);
	viewer.style = viewer.owner.sheet.cssRules[index];
}
