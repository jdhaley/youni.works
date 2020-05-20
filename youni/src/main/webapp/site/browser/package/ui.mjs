export default {
	package$: "youni.works/ui",
	package$component: "youni.works/component",
	Frame: {
		super$: "component.Owner",
		window: null,
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
		var$device: {
		},
		var$viewer: {
		},
		extend$signal: {
			Event: function(on, event) {
				while (on && event.action) {
					event[Symbol.Signal] = "Event";
					on.receive && on.receive(event);
					on = on.parentNode;
				}
			},
			Message: function signal(on, message) {
				message[Symbol.Signal] = "Message";
				if (message.action) on.receive && on.receive(message);
				if (message.action) for (on of on.childNodes) {
					signal(on, message);
					if (!message.action) break;
				}
			},
			Broadcast: function(on, signal) {
				if (!signal.action) return;
				let list = on.querySelectorAll(signal.selector);
				for (let on of list) {
					signal[Symbol.Signal] = "Broadcast";
					on.receive && on.receive(signal);
					if (!signal.action) break;
				}
			}
		},
		extend$sense: {
			event: function(target, action) {
				const owner = target.owner;
				const signal = owner.signal.Event;
				target.addEventListener(action.toLowerCase(), event => {
					event.owner = owner;
					event.action = action;
					signal(event.target, event);
					if (!event.action) event.preventDefault();
				});
			},
			//Propagate from the selection container rather than the event target:
			selection: function(target, action) {
				const owner = target.owner;
				const signal = owner.signal.Event;
				target.addEventListener(action.toLowerCase(), event => {
					event.owner = owner;
					event.action = action;
					signal(owner.selection.commonAncestorContainer, event);
					if (!event.action) event.preventDefault();
				});
			}
		},
		createView: function(name) {
			let doc = this.window.document;
			return arguments.length ? doc.createElement("" + name) : doc.createDocumentFragment();
		},
		before$initialize: function(conf) {
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
			this.part.main && this.content.append(this.part.main.createView());
			let message = this.sys.extend();
			message.action = "open";
			this.receive(message);
		}
	},
	Viewer: {
		super$: "component.Controller",
		controlName: "div",
		after$initialize: function(conf) {
			this.owner.viewer["I" + this.id] = this;
			if (this.style) this.style = defineRule(this, conf);
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
		draw: function(view) {
			view.innerHTML = "" + view.model;
		},
		model: function(view) {
			return view.textContent;
		},
		extend$shortcut: {
		},
		extend$action: {
			draw: function(on, signal) {
				this.draw(on);
			}
		}
	},
	Main: {
		super$: "Viewer",
		controlName: "main",
		var$group: {
		},
		after$initialize: function(conf) {
			for (let name in conf.actions) this.initializeAction(name, conf.actions[name]);
		},
		initializeAction: function(name, conf) {
			if (conf.group) {
				for (let group of conf.group.split()) {
					if (!this.group[group]) this.group[group] = this.sys.extend();
					this.group[group][name] = conf;					
				}
			}
			if (conf.action) {
				this.action[name] = conf.action;
			} else if (!this.action[name]) {
				this.log.warn(`Main viewer: Action "${name}" is not handled.`);
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
					this.owner.service.get.service(this.owner, "load", location.search.substring(1) + ".view");
				}
			},
			load: function(on, message) {
				if (message.status == 200) {
					let model = this.owner.createView("div");
					model.innerHTML = message.content;
					model = model.firstChild.innerHTML;
					on.model = model;
					message.action = "draw";
				} else if (message.status == 404) {
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
				let file = this.owner.window.location.search.substring(1) + ".view";
				this.owner.service.save.service(this.owner, "saved", JSON.stringify({
					[file]: on.body.outerHTML
				}));
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
