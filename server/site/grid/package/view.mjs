const observers = Symbol("observers");

export default {
	package$: "youni.works/base/view",
	use: {
		package$control: "youni.works/base/control"		
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
	Viewer: {
		super$: "use.control.Controller",
		type$owner: "ViewOwner",
		viewName: "div.view",
		events: null,
		createView: function(parent, model, conf) {
			let view = this.owner.append(parent, this.viewName);
			this.draw(view, model, conf);
			this.bind(view, model, conf);
			return view;
		},
		draw: function(view, model, conf) {
		},
		bind: function(view, model, conf) {
			view.model = model;
			view.receive = Control_receive;
			view.controller = this;
			this.controlEvents(view);
			this.control(view);
			this.owner.bind(view, model);
			return view;
		},
		control: function(view) {
		},
		controlEvents: function(view) {
			for (let event in this.events) {
				let listener = this.events[event];
				view.addEventListener(event, listener);
			}
		}
	},
	Item: {
		super$: "Viewer",
		viewName: ".item",
		draw: function(view, model) {
			view.header = this.createHeader(view, model);
			view.body = this.createBody(view, model);
			view.footer = this.createFooter(view, model);
		},
		createHeader: function(item, model) {
		},
		createBody: function(item, model) {
		},
		createFooter: function(item, model) {
		},
		startMove: function(view) {
			return false;
		},
		extend$actions: {
			mousedown: function(on, event) {
				let current = on.ownerDocument.querySelector(".active");
				if (current) current.classList.remove("active");
				on.classList.add("active");
				event.target.focus();
				if (this.startMove(on, event.mouseTarget)) {
					let box = on.getBoundingClientRect();
					on.MOVE = {
						x: event.pageX - box.x,
						y: event.pageY - box.y,
					}
					event.preventDefault();
				}
			},
			mousemove: function(on, event) {
				if (on.MOVE) {
					on.style.left = event.pageX - on.MOVE.x  + "px";
					on.style.top = event.pageY  - on.MOVE.y  + "px";		
				}
			},
			mouseup: function(on, event) {
				delete on.MOVE;
			},
			mouseleave: function(on, event) {
				delete on.MOVE;
			}
		}
	}
}
function Control_receive(event) {
	this.controller && this.controller.process(this, event);
}