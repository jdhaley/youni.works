let STATE;

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
		identify: function() {
			return ++STATE.lastId;
		},
		extend$action: {
			MouseMove: function(on, event) {
				if (event.buttons == 1 && STATE.selection) {
					let x = event.offsetX - event.offsetX % this.cellSize;
					let y = event.offsetY - event.offsetY % this.cellSize;
					STATE.selection.controller.move(STATE.selection, x, y);
				}
			},
			MouseDown: function(on, event) {
				STATE.selection && STATE.selection.classList.remove("selected");
				if (event.target.classList.contains("selectable")) {
//					if (STATE.selection == event.target) {
//						STATE.selection = null;
//						return;
//					}
					
					if (STATE.selection && event.altKey) {
						this.part.connector.create(on, STATE.selection, event.target);
					}

					STATE.selection = event.target;
					STATE.selection.classList.add("selected");
					
				} else {
					if (event.altKey) {
						let x = event.offsetX - event.offsetX % this.cellSize;
						let y = event.offsetY - event.offsetY % this.cellSize;
						STATE.selection = this.part.node.create(on, x, y);
					}
				}
			},
			MouseUp: function(on, event) {
			}
		},
		initialize: function(conf) {
			this.super("initialize", conf);
			STATE = this.sys.extend();
			STATE.selection = null;
			STATE.lastId = 0;
		}
	},
	Box: {
		super$: "Graphic",
		create: function(x, y) {
			let box = this.view();
			box.setAttribute("width", this.width);
			box.setAttribute("height", this.height);
			this.move(box, x, y);
			return box;										
		},
		move: function(box, x, y) {
			x = x - box.getAttribute("width") / 2;
			y = y - box.getAttribute("height") / 2;
			box.setAttribute("x", x);
			box.setAttribute("y", y);		
		}
	}
}