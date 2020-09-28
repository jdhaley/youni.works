const observers = Symbol("observers");
export default {
	package$: "youni.works/base/view",
	use: {
		package$control: "youni.works/base/control",
	},
	ViewOwner: {
		super$: "use.control.Owner",
		create: function(doc, name, attributes) {
			let baseClass = "";
			let dot = name.indexOf(".");
			switch (dot) {
				case -1:
					break;
				case 0:
					baseClass = name.substring(1);
					name = "div";
					break;
				default:
					baseClass = name.substring(dot + 1);
					name = name.substring(0, dot);
					break;
			}
			let ele = doc.createElement(name);
			this.setAttributes(ele, attributes);
			if (baseClass) ele.classList.add(baseClass);
			return ele;
		},
		setAttributes(ele, attributes) {
			if (attributes) for (let name in attributes) {
				ele.setAttribute(name, attributes[name]);
			}
		},
		append: function(parent, name, attributes) {
			let ele = this.create(parent.ownerDocument, name, attributes);
			parent.append(ele);
			return ele;
		},
		getViewContext: function(view, name) {
			while (view) {
				if (view.classList && view.classList.contains(name)) {
					return view;
				}
				view = view.parentNode;
			}
		},
		extend$transmit: {
			up: function(on, event) {
				event.stopPropagation && event.stopPropagation();
				while (on && event.type) {
					on.receive && on.receive(event);
					on = on.parentNode;
				}
			},
			//NB: down() is explicitly named because it is recursive.
			down: function down(on, message) {
				event.stopPropagation && event.stopPropagation();
				for (on of on.childNodes) {
					if (!message.type) return;
					on.receive && on.receive(message);
					down(on, message);
				}
			}
		}
	},
	View: {
		super$: "use.control.Controller",
		type$owner: "ViewOwner",
		viewName: "div.view",
		bind: function(control, value) {
			return this.owner.bind(control, value);
		},
		forType: function(value, conf) {
			return (parent, value, conf) => this.owner.append(parent, this.viewName);
		},
		createView: function(parent, model, conf) {
			let constr = this.forType(model, conf);
			let view = constr.call(this, parent, model, conf);
			view.conf = conf;
			this.owner.control(view, this);
			this.draw(view, model);
			this.control(view);
			return view;
		},
		draw: function(view, value) {
		},
		control: function(view) {
		},
		extend$actions: {
			keydown: function(on, event) {
				let shortcut = this.shortcuts[event.key];
				if (shortcut) shortcut.call(this, on, event);
			}
		},
		extend$shortcuts: {
		}
	}
}