export default {
	package$: "youni.works/web/graphic",
	use: {
		package$control: "youni.works/base/control",
		package$graph: "youni.works/base/graph",
		package$view: "youni.works/web/view"
	},
	Graphic: {
		super$: "use.view.Viewer",
		type$graph: "use.graph",
		after$view: function(model) {
			let view = Function.returned;
			if (model) model.view = view;
			return view;
		}
	},
	GraphicContext: {
		super$: "Graphic",
		media: {
			type: "image/svg",
			extension: ".svg"
		},
		viewName: "http://www.w3.org/2000/svg/svg",
		cellSize: 1,
		identify: function(gc) {
			if (!gc.lastId) gc.lastId = 0;
			return ++gc.lastId;
		},
		after$control: function(view) {
			view.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		},
		extend$action: {
			MouseMove: function(on, event) {
				//event.action = "";
				if (event.buttons == 1 && on.selection) {
					on.selection.classList.add("selected");
					let node = on.selection.model;
					node.x = event.clientX - event.clientX % this.cellSize;
					node.y = event.clientY - event.clientY % this.cellSize;
					on.selection.controller.draw(on.selection);
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
	}
}