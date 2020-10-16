const observers = Symbol("observers");

function UP(event, from) {
	let controller = event.currentTarget.controller;
	controller && controller.owner.transmit.up(from || event.target, event);
}

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
		getClipboard: function(clipboard) {
			let data = clipboard.getData("application/json") || clipboard.getData("text/plain");
			try {
				data = JSON.parse(data);
			} catch (e) {
			}
			return data;
		},
		setClipboard: function(clipboard, node) {
			let data = this.getSelectedElements(node);
			if (data) {
				data = JSON.stringify(data);
				clipboard.setData("application/json", data);	
				clipboard.setData("text/plain", data);
				return true;
			}
		},
		getSelectedElements: function(node) {
			let data = []
			for (let selected of node.querySelectorAll(".selected")) {
				data.push(selected.model);
			}
			return data.length ? data : null;
		},
		extend$transmit: {
			up: function(on, event) {
				event.stopPropagation && event.stopPropagation();
				if (!event.topic) event.topic = event.type;
				while (on && event.topic) {
					on.receive && on.receive(event);
					on = on.parentNode || on.defaultView;
				}
			},
			//NB: down() is explicitly named because it is recursive.
			down: function down(on, message) {
				event.stopPropagation && event.stopPropagation();
				if (!event.topic) event.topic = event.type;
				for (on of on.childNodes) {
					if (!message.topic) return;
					on.receive && on.receive(message);
					down(on, message);
				}
			}
		}
	},
	Frame: {
		super$: "use.control.Controller",
		type$owner: "ViewOwner",
		conf: null,
		view: null,
		initialize: function() {
			this.owner.control(this.view, this);
		},
		events: {
			input: UP,
			cut: UP,
			copy: UP,
			paste: UP,
			keydown: UP,

			mousedown: UP,
			mouseup: UP,
			mousemove: UP,
			mouseleave: UP,
			click: UP,
			contextmenu: UP,
			
			dragstart: UP,
			dragover: UP,
			drop: UP,
		},
		extend$actions: {
			keydown: function(on, event) {
				let shortcut = this.shortcuts[event.key];
				if (shortcut) shortcut.call(this, on, event);
			}	
		},
		extend$shortcuts: {
			Escape: function(on, event) {
				let active = this.view.document.querySelector(".active");
				if (active) {
					if (active.priorWindow) active.priorWindow.controller.activate(active.priorWindow);
					active.style.display = "none";
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
		//TODO flip the argument order
		forType: function(value, conf) {
			return (parent, value, conf) => this.owner.append(parent, this.viewName);
		},
		createView: function(parent, conf, data, index) {
			let constr = this.forType(data, conf);
			let view = constr.call(this, parent, data, conf);
			view.conf = conf;
			this.owner.control(view, this);
			this.draw(view, data, index);
			this.control(view);
			return view;
		},
		draw: function(view, value, index) {
		},
		control: function(view) {
		},
		focusInto: function(view) {
			view.focus();
			return view;
		},
		extend$actions: {
			keydown: function(on, event) {
				let shortcut = this.shortcuts[event.key];
				if (shortcut) shortcut.call(this, on, event);
			},
			dragstart: function(on, event) {
				if (on.classList.contains("selected")) {
					if (on.draggable) {
						event.topic = "";
						if (on.model) {
							let data = JSON.stringify(on.model);
							event.dataTransfer.effectAllowed = "copyMove";
							event.dataTransfer.setData("text/plain", data);
							console.log("start drag on: ", data);
						}
					}					
				} else {
					event.preventDefault();
				}
			},
			drop: function(on, event) {
			},
			click: function(on, event) {
				if (!event.ctrlKey) {
					for (let selected of on.ownerDocument.body.querySelectorAll(".selected")) {
						selected.classList.remove("selected");
					}
				}
				if (!on.selectable) return;
				if (on.classList.contains("selected")) {
					for (let selected of on.querySelectorAll(".selected")) {
						selected.classList.remove("selected");
					}
				} else {
					on.classList.add("selected");										
				}
				event.topic = "";
			}
		},
		extend$shortcuts: {
		}
	}
}