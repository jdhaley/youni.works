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
	Control: {
		super$: "Object",
		type$owner: "Owner",
		receive: function(event) {
			let action = this.action && this.action[event.topic];
			action && action.call(this, event);
		},
		"@iterator": function* iterate() {
//			const parts = this.parts;
//			if (!parts) return;
//			if (parts.length) {
//				for (let i = 0, length = parts.length; i < length; i++) yield parts[i];				
//			} else {
//				for (let name in parts) yield parts[name];				
//			}
		}
	},
	View: {
		super$: "Control",
		view: null,
		get$container: function() {
			return this.view && this.view.parentNode && this.view.parentNode.control;
		},
//		model: undefined,
		get$owner: function() {
			return this.view ? this.view.ownerDocument.owner : document.owner;
		},
		"@iterator": function* iterate() {
			 if (this.view) for (let view of this.view.childNodes) {
				if (view.control) yield view.control;
			}
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
