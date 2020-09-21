const observers = Symbol("observers");
export default {
	package$: "youni.works/base/view",
	use: {
		package$control: "youni.works/base/control",
		package$remote: "youni.works/web/remote"
	},
	ViewOwner: {
		super$: "use.control.Owner",
		type$remote: "use.remote.Remote",
		open: function(pathname, receiver) {
			this.remote.service(receiver, "opened", {
				url: pathname,
				method: "GET"
			});
		},
		save: function(pathname, content, receiver) {
			this.remote.service(receiver, "saved", {
				url: pathname,
				content: content,
				method: "PUT"
			});
		},
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
			this.bind(view, model, conf);
			this.draw(view);
			this.activate(view);
			return view;
		},
		bind: function(view, model, conf) {
			view.receive = Control_receive;
			view.controller = this;
			view.conf = conf;
			for (let event in this.events) {
				let listener = this.events[event];
				view.addEventListener(event, listener);
			}
			this.owner.bind(view, this.model(view, model));
			this.control(view);
			return view;
		},
		model: function(view, value) {
			return value;
		},
		draw: function(view) {
		},
		control: function(view) {
		},
		activate: function(view) {
		},
		controlEvents: function(view) {
		}
	},
	Item: {
		super$: "Viewer",
		viewName: ".item",
		draw: function(view) {
			view.header = this.createHeader(view);
			view.body = this.createBody(view);
			view.footer = this.createFooter(view);
			this.activate(view);
		},
		createHeader: function(item) {
		},
		createBody: function(item) {
		},
		createFooter: function(item) {
		},
		startMove: function(view) {
			return false;
		},
		moveTo: function(item, x, y) {
			item.style.left = x + "px";
			item.style.top = y + "px";
		},
		extend$actions: {
			mousedown: function(on, event) {
				if (this.startMove(on, event.mouseTarget)) {
					let box = on.getBoundingClientRect();
					on.MOVE = {
						x: event.pageX - box.x,
						y: event.pageY - box.y,
					}
					event.preventDefault();
				}
				this.activate(on);
			},
			mousemove: function(on, event) {
				if (on.MOVE) {
					this.moveTo(on, event.pageX - on.MOVE.x, event.pageY  - on.MOVE.y);
				}
			},
			mouseup: function(on, event) {
				delete on.MOVE;
			},
			mouseleave: function(on, event) {
			//	delete on.MOVE;
			}
		}
	}
}
function Control_receive(event) {
	this.controller && this.controller.process(this, event);
}