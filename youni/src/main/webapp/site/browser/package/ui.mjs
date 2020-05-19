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
			this.initializePlatform(conf);
		},
		initializePlatform: function(conf) {
			let document = this.window.document;
			document.owner = this;
			let ele = document.createElement("style");
			ele.type = "text/css";
			document.head.appendChild(ele);
			this.$style = ele.sheet;
			this.sys.implement(window.Node.prototype, conf.platform.node);
			this.sys.implement(window.Range.prototype, conf.platform.range);
			this.device = this.sys.extend(null, conf.platform.devices);
		},
		activate: function() {
		}
	},
	Viewer: {
		super$: "component.Controller",
		after$initialize: function(conf) {
			this.owner.viewer["I" + this.id] = this;
			if (this.style) addStyle(this, conf);
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
	}
}

function addStyle(viewer) {
	let out = `[data-view=I${viewer.id}] {`;
	for (let name in viewer.style) {
		out += name + ":" + viewer.style[name] + ";"
	}
	out += "}";
	let index = viewer.owner.$style.insertRule(out);
	viewer.style = viewer.owner.$style.cssRules[index];
}
