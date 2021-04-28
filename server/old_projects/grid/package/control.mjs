Symbol.observers = Symbol("observers");

export default {
	package$: "youni.works/base/control",
	Control: {
		super$: null,
		receive: function(event) {
			this.controller && this.controller.process(this, event);
		}
	},
	Controller: {
		super$: "Object",
		type$owner: "Owner",
		events: {
		},
		actions: {
		},
		process: function(control, message) {
			let action = typeof message == "object" && message ? message.topic : message;
			action = action && this.actions[action];
			action && action.call(this, control, event);
		}
	},
	Owner: {
		super$: "Object",
		use: {
			type$Control: "Control"
		},
		control: function(object, controller) {
			if (!controller) return;
			object.controller = controller;
			object.receive = this.use.Control.receive;
			if (object.addEventListener) for (let event in controller.events) {
				let listener = controller.events[event];
				object.addEventListener(event, listener);
			}
		},
		bind: function(control, model) {
			this.unbind(control);
			if (model && typeof model == "object") {
				if (!model[Symbol.observers]) model[Symbol.observers] = [];
				model[Symbol.observers].push(control);
			}
			control.model = model;
			return model;
		},
		unbind: function(control) {
			if (control.model && control.model[Symbol.observers]) {
				let list = control.model[Symbol.observers];
				for (let i = 0, len = list.length; i < len; i++) {
					if (control == list[i]) {
						list.splice(i, 1);
						break;
					}
				}
			}
			delete control.model;
			return control;
		},
		transmit: {
			object: function(on, event) {
				event.stopPropagation && event.stopPropagation();
				if (!event.topic) event.topic = event.type;
				let object = event.object; 
				if (object && object[Symbol.observers]) {
					//The observers might bind() or unbind() so copy the array...
					for (let on of object[Symbol.observers].slice()) {
						if (!event.topic) return;
						on && on.receive && on.receive(event);
					}
				}
			}
		}
	}
}
