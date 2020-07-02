export default {
	package$: "youni.works/web/graphic",
	use: {
		package$control: "youni.works/base/control",
		package$graph: "youni.works/base/graph",
		package$view: "youni.works/web/view"
	},
	Graphic: {
		super$: "use.control.Processor",
		type$graph: "use.graph",
		type$owner: "use.view.Frame",
		get$controller: function() {
			return this.owner;
		},
		viewName: "",
		view: function(model) {
			let view = this.owner.window.document.createElementNS("http://www.w3.org/2000/svg", this.viewName);
			if (this.template) view.innerHTML = this.template;
			if (model) {
				model.view = view;
				view.model = model;
			}
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