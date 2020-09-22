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
		process: function(control, event) {
			let action = this.actions && this.actions[event.type];
			action && action.call(this, control, event);
		}
	},
	Owner: {
		super$: "Object",
		transmit: {
			object: function(on, event) {
				event.stopPropagation && event.stopPropagation();
				let object = event.object; 
				if (object && object[Symbol.observers]) {
					//The observers might bind() or unbind() so copy the array...
					for (let on of object[Symbol.observers].slice()) {
						if (!event.type) return;
						on && on.receive && on.receive(event);
					}
				}
			}
		},
		bind: function(control, model) {
			this.unbind(control);
			if (model && typeof model == "object") {
				if (!model[Symbol.observers]) model[Symbol.observers] = [];
				model[Symbol.observers].push(control);
			}
			control.model = model;
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
		},
	}
}
