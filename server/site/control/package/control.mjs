Symbol.observers = Symbol("observers");

export default {
	package$: "youni.works/base/control",
	Owner: {
		super$: "Object",
		extend$types: {
		},
		create: function(type, conf) {
			if (!this.types[type]) {
				console.error(`Type "${type}" does not exist.`);
				return;
			}
			let control = this.sys.extend(this.types[type], conf);
			this.sys.define(control, "view", this.document.createElement(control.role));
			control.view.control = control;
			return control;
		}
	},
	Control: {
		super$: "Object",
		view: null,
		data: undefined,
		get$owner: function() {
			return this.view ? this.view.ownerDocument.owner : null;
		},
		receive: function(event) {
			let action = this.action && this.action[event.topic];
			action && action.call(this, event);
		}
	}
}
