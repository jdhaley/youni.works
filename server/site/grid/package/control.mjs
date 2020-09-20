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
//	LinkControl: {
//		super$: "Object",
//		type$object: "Object",
//		index: "",
//		type$value: "Object",
//		receive: function(event) {
//			let fn = this.events[event.type];
//			fn && fn.call(this, event);
//		},
//		events: {
//			updated: function(event) {
//				if (event.object == this.value) {
//					this.transmit({
//						type: "update",
//						object: this.object,
//						index: this.index,
//						priorValue: this.value
//					});
//				}
//			},
//			deleted: function(event) {
//				if (event.object == this.value) {
//					this.object[this.index] = undefined; //check JSON serialization of object/array.
//					this.transmit({
//						type: "update",
//						object: this.object,
//						index: this.index,
//						priorValue: this.value
//					});
//					//unbind()???
//				}
//			}
//		}
//	},
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
			if (model !== undefined) control.model = model;
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
