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
	},
	Collection: {
		super$: "View",
		use: {
			type$Element: "View"
		},
		extend$actions: {
			created: function(on, event) {
				let ele = this.createElement(on, event.value, event.index);
				let rel = this.elementOf(on, event.index);
				if (rel) on.insertBefore(ele, rel);
				ele.focus();
			},
			deleted: function(on, event) {
				let ele = this.elementOf(on, event.index);
				let goto = ele.nextSibling || ele.previousSibling || ele.parentNode;
				ele.remove();
				goto.focus();
			},
			moved: function(on, event) {
				let ele = this.elementOf(on, event.index);
				ele.remove();
				let to = this.elementOf(on, event.value);
				on.insertBefore(ele, to);
				//Group: ele.focus();
				if (ele.goto_cell) {
					ele.goto_cell.focus();
					delete ele.goto_cell;
				} else {
					ele.firstChild.focus();
				}
			}
		},
		draw: function(view, value) {
			value = this.bind(view, value);
			if (value) {
				if (value[Symbol.iterable]) {
					for (let ele of value) this.createElement(view, ele, i++);					
				} else {
					for (let key in value) this.createElement(view, value[key], key);
				}
			}
		},
		createElement: function(view, value, index) {
			return this.use.Element.createView(view, value, view.conf);
		},
		findElement: function(node) {
			return this.owner.getViewContext(node, "element");
		},
		findCollection: function(node) {
			return this.owner.getViewContext(node, "collection");
		},
		indexOf: function(view) {
			view = this.findElement(view);
			let collection = this.findCollection(view);
			let index = -1;
			if (collection) for (let ele of collection.childNodes) {
				index++;
				if (view == ele) return index;
			}
			return index;
		},
		elementOf: function(view, index) {
			if (typeof index == "number") {
				return view.childNodes[index];
			} else {
				for (let ele of view.childNodes) {
					if (ele.index === index) return ele;
				}
			}
		}
	},
	Item: {
		super$: "View",
		viewName: ".item",
		draw: function(view, value) {
			view.header = this.createHeader(view, value);
			view.body = this.createBody(view, value);
			view.footer = this.createFooter(view, value);
		},
		createHeader: function(item, value) {
		},
		createBody: function(item, value) {
		},
		createFooter: function(item, value) {
		},
		control: function(view) {
			this.activate(view);
		},
		activate: function(item) {
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