export default {
	package$: "youni.works/base/container",
	use: {
		package$view: "youni.works/base/view",
	},	
	Collection: {
		super$: "use.view.View",
		use: {
			type$Element: "use.view.View"
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
		},
		getSelected: function(on) {
			let rows = []
			for (let selected of on.querySelectorAll(".selected")) {
				rows.push(this.indexOf(selected));
			}
			return rows.length ? rows : null;
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
			click: function(on, event) {
				if (!event.ctrlKey) {
					for (let selected of on.querySelectorAll(".selected")) {
						selected.classList.remove("selected");
					}
				}
				event.preventDefault();
				event.stopPropagation();
				let row = this.findElement(event.target);
				row.classList.add("selected");
			},
			cut: function(on, event) {
				let rows = this.getSelected(on);
				if (rows) {
					event.preventDefault();
					event.stopPropagation();
					let data = [];
					for (let index of rows) {
						data.push(on.model[index]);
					}
					data = JSON.stringify(data);
					event.clipboardData.setData("application/json", data);	
					event.clipboardData.setData("text", data);	
					let app = this.owner.getViewContext(on, "application");
					app.commands.cut(on, rows);					
				}
			},
			copy: function(on, event) {
				let rows = this.getSelected(on);
				if (rows) {
					event.preventDefault();
					event.stopPropagation();
					let data = [];
					for (let index of rows) {
						data.push(on.model[index]);
					}
					data = JSON.stringify(data);
					event.clipboardData.setData("application/json", data);	
					event.clipboardData.setData("text", data);	
				}
			},
			paste: function(on, event) {
				let cb = event.clipboardData;
				let data = cb.getData("text");
				try {
					data = JSON.parse(data);
				} catch (e) {
				}
				if (typeof data == "object" && data.length) {
					event.preventDefault();
					event.stopPropagation();
					let currentRow = this.owner.getViewContext(event.target, "row");
					let index = currentRow ? this.indexOf(currentRow) : on.childNodes.length + 1;
					let app = this.owner.getViewContext(on, "application");
					app.commands.paste(on, index, data);
				}
			}
		}
	},
	Item: {
		super$: "use.view.View",
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