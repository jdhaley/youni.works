Symbol.observers = Symbol("observers");

export default {
	package$: "youni.works/base/control",
	Owner: {
		super$: "Object",
		extend$types: {
		},
		extend$transmit: {
			up: function(on, event) {
				//event.stopPropagation && event.stopPropagation();
				while (on && event.topic) {
					on.receive(event);
					on = on.container;
				}
			},
			//NB: down() is explicitly named because it is recursive.
			down: function down(on, message) {
				//event.stopPropagation && event.stopPropagation();
				for (on of on) {
					if (!message.topic) return;
					on.receive(message);
					down(on, message);
				}
			}
		},
		create: function(name, conf) {
			if (!this.types[name]) {
				console.error(`Type "${name}" does not exist.`);
				return;
			}
			let control = this.sys.extend(this.types[name], conf);
			if (!control.view) this.sys.define(control, "view", this.document.createElement(control.role));
			return control;
		}
	},
	Receiver: {
		super$: "Object",
		getAction: function(message) {
			return this[message.topic];
		},
		receive: function(message) {
			message.action = this.getAction(message)
			message.action && message.action[message.length ? "apply" : "call"](this, message);
		}
	},
	View: {
		super$: "Receiver",
		view: null,
		"@iterator": function* iterate() {
			if (this.view) for (let view of this.view.childNodes) {
				if (view.control) yield view.control;
			}
		},
		get$container: function() {
			return this.view && this.view.parentNode && this.view.parentNode.control;
		},
//		model: undefined,
		get$owner: function() {
			return this.view ? this.view.ownerDocument.owner : document.owner;
		},
		append: function(control) {
			this.view.append(control.view);
			if (!this.parts) return;
			if (this.parts.length) {
				this.parts.push(control);
			} else {
				this.parts[control.index] = control;
			}
		},
		initialize: function(events) {
			if (this.view) for (let event in events) {
				let listener = events[event];
				this.view.addEventListener(event, listener);
			}
		}
	}
}
