Symbol.observers = Symbol("observers");

export default {
	package$: "youni.works/base/control",
	Owner: {
		super$: "Object",
		extend$types: {
		},
		create: function(name, conf) {
			if (!this.types[name]) {
				console.error(`Type "${name}" does not exist.`);
				return;
			}
			let control = this.sys.extend(this.types[name], conf);
			if (!control.node) this.sys.define(control, "node", this.document.createElement(control.role));
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
		node: null,
//		model: undefined,
		get$owner: function() {
			return this.node ? this.node.ownerDocument.owner : null;
		},
		"@iterator": function* iterate() {
			 if (this.node) for (let node of this.node.childNodes) {
				if (node.control) yield node.control;
			}
		},
		append: function(view) {
			this.node.append(view.node);
			if (!this.parts) return;
			if (this.parts.length) {
				this.parts.push(view);
			} else {
				this.parts[view.name] = view;
			}
		},
		view: function(model) {
		}
	}
}
