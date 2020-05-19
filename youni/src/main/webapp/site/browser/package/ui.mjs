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
		after$initialize: function(conf) {
			this.owner.viewer["I" + this.id] = this;
			if (this.style) this.style = defineRule(this, conf);
		},
		createView: function(model) {
			let view = this.owner.createView(this.controlName || "div");
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
			}
			this.group = group;
		},
		open: function() {
			let location = this.owner.window.location;
			if (location.search) {
				this.owner.window.document.title = location.search.substring(location.search.lastIndexOf("/") + 1);
				this.owner.service.get.service(this.owner, "load", location.search.substring(1) + ".view");
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
				this.open();				
			},
			load: function(on, message) {
				let model = "";
				switch (message.status) {
					case 200:
						model = this.owner.createView("div");
						model.innerHTML = message.content;
						model = model.firstChild.innerHTML;
						break;
					case 404:
						model = "<h1>" + this.owner.window.document.title + " (New)</h1>";
						break;
					default:
						model = "<font color=red>" + message.content + "</font>";
						break;
				}
				on.model = model;
				message.action = "draw";
			},
			KeyDown: function(on, event) {
				event.device = this.owner.device.keyboard;
				event.action = this.getShortcut(event) || this.getAction(event);
			},
			//move to & use devices, etc... ribbon actions need a controller.
			Click: function(on, event) {
				console.log("click");
				let action = event.target.parentNode.dataset.command;
				if (action) event.action = action;
			}
		}		
	}
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
