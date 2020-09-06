const observers = Symbol("observers");

export default {
	package$: "youni.works/base/view",
	use: {
		package$control: "youni.works/base/control"		
	},
	ViewOwner: {
		super$: "use.control.Owner",
		ownerOf: function(document) {
			if (!document.owner) {
				document.owner = this.sys.extend(this, {
					document: document,
					classes: []
				});
			}
			return document.owner;
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
		viewAttributes: function(model, type) {
			return null;
		},
		classOf: function(ele) {
			let owner = this.owner.ownerOf(ele);
			let cls = owner.classes[this.viewName];
			if (!cls) {
				cls = this.sys.extend(null, {
					controller: this
				});
				owner.classes[this.viewName] = cls;
			}
			return cls;
		},
		createView: function(parent, model, type) {
			let owner = this.owner.ownerOf(parent);
			let view = owner.append(parent, this.viewName, this.viewAttributes(model, type));
			this.view(view, model);
			return view;
		},
		view: function(view, model) {
			view.receive = Control_receive;
			view.controller = this;
			this.owner.bind(view, model);
			this.draw(view);
			this.controlEvents(view);
			this.control(view);
			return view;
		},
		draw: function(view) {
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
		startMove: function(view) {
		},
		draw: function(view) {
			view.header = this.drawHeader(view);
			view.body = this.drawBody(view);
			view.footer = this.drawFooter(view);
			view.style.top = "100px";
			view.style.left = "100px";
		},
		drawHeader: function(view) {
			let header = this.owner.append(view, "div.header");
			//header.contentEditable = true;
			header.innerHTML = "<br>";
			return header;
		},
		drawBody: function(view) {
			return this.owner.append(view, "div.body");
		},
		drawFooter: function(view) {
			return this.owner.append(view, "div.footer");
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