export default {
	package$: "youni.works/web/graphic",
	use: {
		package$control: "youni.works/base/control",
		package$view: "youni.works/web/view"
	},
	Graphic: {
		super$: "use.control.Processor",
		type$owner: "use.view.Frame",
		get$controller: function() {
			return this.owner;
		},
		viewName: "",
		view: function() {
			let view = this.owner.window.document.createElementNS("http://www.w3.org/2000/svg", this.viewName);
			this.control(view);
			return view;
		},
		control: function(view) {
			this.sys.define(view, "controller", this, "const");
		},
		before$initialize: function(conf) {
			this.sys.define(this, "owner", conf.owner, "const");
		},
		extend$action: {
			MouseDown: function(on, event) {
				if (on.classList.contains("selectable")) event.selection = on;
			}
		}
	},
	GraphicContext: {
		super$: "Graphic",
		viewName: "svg",
		cellSize: 1,
		identify: function(gc) {
			if (!gc.lastId) gc.lastId = 0;
			return ++gc.lastId;
		},
		extend$action: {
			MouseMove: function(on, event) {
				if (event.buttons == 1 && on.selection) {
					let x = event.offsetX - event.offsetX % this.cellSize;
					let y = event.offsetY - event.offsetY % this.cellSize;
					on.selection.controller.move(on.selection, x, y);
				}
			},
			MouseDown: function(on, event) {
				on.selection && on.selection.classList.remove("selected");
				if (event.selection) {
					
					if (on.selection && event.altKey) {
						this.part.connector.create(on, on.selection, event.selection);
					}

					on.selection = event.selection;
					on.selection.classList.add("selected");
					
				} else {
					if (event.altKey) {
						let x = event.offsetX - event.offsetX % this.cellSize;
						let y = event.offsetY - event.offsetY % this.cellSize;
						on.selection = this.part.node.create(on, x, y);
					}
				}
			}
		}
	},
	Box: {
		super$: "Graphic",
		create: function(x, y) {
			let box = this.view();
			this.size(box, this.width, this.height);
			this.move(box, x, y);
			return box;										
		},
		size: function(box, width, height) {
			let x = box.getAttribute("x") * 1 + (width - box.getAttribute("width") * 1) / 2;
			let y = box.getAttribute("y") * 1 + (height - box.getAttribute("height") * 1) / 2;
			box.setAttribute("x", x);
			box.setAttribute("y", y);		
			box.setAttribute("width", width);
			box.setAttribute("height", height);
		},
		move: function(box, x, y) {
			x = x - (box.getAttribute("width") || 0) / 2;
			y = y - (box.getAttribute("height") || 0) / 2;
			box.setAttribute("x", x);
			box.setAttribute("y", y);		
		}
	}
}