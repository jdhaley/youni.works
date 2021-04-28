export default {
	package$: "youni.works/base/container",
	use: {
		package$view: "youni.works/base/view",
	},	
	Container: {
		super$: "use.view.View",
		use: {
			type$Element: "use.view.View"
		},
		bind: function(control, data) {
			if (!data) data = [];
			if (!data.length && data.push) data.push(this.sys.extend());
			return this.owner.bind(control, data);
		},
		draw: function(view, data) {
			data = this.bind(view, data);
			if (data) {
				if (data[Symbol.iterator]) {
					let i = 0;
					for (let ele of data) this.createElement(view, ele, i++);					
				} else {
					for (let key in data) this.createElement(view, data[key], key);
				}
			}
		},
		createElement: function(view, data, index) {
			return this.use.Element.createView(view, view.conf, data, index);
		},
		focusInto: function(view, back) {
			view = back ? view.lastChild : view.firstChild;
			return view.controller.focusInto(view, back);
		}
	},
	Composite: {
		super$: "use.view.View",
		draw: function(view, value, index) {
			value = this.bind(view, value);
			this.createKey(view, index);
			this.createParts(view, value);
		},
		createKey: function(row, value, index) {
		},
		createParts: function(view, value) {
			view.parts = Object.create(null);
			for (let conf of view.conf) {
				this.createPart(view, value, conf);
			}
		},
		createPart: function(view, value, conf) {
		},
		focusInto: function(view, back) {
			view = back ? view.lastChild : view.firstChild;
			return view.controller.focusInto(view, back);
		},
		extend$actions: {
			updated: function(on, event) {
				let part = on.parts[event.index];
				part.controller.update(part, event.value);
			}
		}
	},
	Collection: {
		super$: "Container",
		selectOnClick: false,
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
		},
		getSelectedIndices: function(on) {
			let indices = []
			for (let selected of on.querySelectorAll(".selected")) {
				indices.push(this.indexOf(selected));
			}
			return indices.length ? indices : null;
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
			},
//			click: function(on, event) {
//				if (!event.ctrlKey) {
//					for (let selected of on.querySelectorAll(".selected")) {
//						selected.classList.remove("selected");
//					}
//					if (!this.selectOnClick) return;
//				}
//				
//				event.preventDefault();
//				let row = this.findElement(event.target);
//				if (row.classList.contains("selected")) {
//					row.classList.remove("selected");
//				} else {
//					row.classList.add("selected");					
//				}
//			},
			cut: function(on, event) {
				event.preventDefault();
				if (this.owner.setClipboard(event.clipboardData, on)) {
					let app = this.owner.getViewContext(on, "application");
					app.commands.cut(on, this.getSelectedIndices(on));					
				}
			},
			paste: function(on, event) {
				event.preventDefault();
				let data = this.owner.getClipboard(event.clipboardData);
				if (typeof data == "object" && data.length) {
					let element = this.findElement(event.target);
					let index = element ? this.indexOf(element) : on.childNodes.length;
					let app = this.owner.getViewContext(on, "application");
					app.commands.paste(on, index, data);
				}
			},
			drop: function(on, event) {
				event.preventDefault();
				event.topic = "";
				let data = event.dataTransfer.getData("text/plain");
				try {
					data = JSON.parse(data);
				} catch (error) {
					return;
				}
				let element = this.findElement(event.target);
				let index = element ? this.indexOf(element) : on.childNodes.length;
				let app = this.owner.getViewContext(on, "application");
				app.commands.paste(on, index, [data]);
			}
		}
	},
	Item: {
		super$: "use.view.View",
		viewName: ".item",
		draw: function(view, data) {
			view.header = this.createHeader(view, data);
			view.body = this.createBody(view, data);
			view.footer = this.createFooter(view, data);
		},
		createHeader: function(item, data) {
		},
		createBody: function(item, data) {
		},
		createFooter: function(item, data) {
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
		focusInto: function(view, back) {
			view = view.body;
			return view.controller.focusInto(view, back);
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