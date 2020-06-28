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
				event.action = "";
				if (event.buttons == 1 && on.selection) {
					on.selection.classList.add("selected");		
					let x = event.clientX - event.clientX % this.cellSize;
					let y = event.clientY - event.clientY % this.cellSize;
					on.selection.controller.move(on.selection, x, y);
				}
			},
			MouseDown: function(on, event) {
				on.selection && on.selection.classList.remove("selected");
				if (event.target.classList.contains("selectable")) {
					if (on.selection && event.altKey) {
						this.part.connector.create(on, on.selection, event.target);
					} else {
						on.selection = event.target;
					}
				} else if (event.altKey && event.target == on) {
					let x = event.clientX - event.clientX % this.cellSize;
					let y = event.clientY - event.clientY % this.cellSize;
					on.selection = this.part.node.create(on, x, y);
				} else {
					on.selection = null;
				}
				on.selection && on.selection.classList.add("selected");
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