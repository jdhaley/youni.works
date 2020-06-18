let STATE;

export default {
	package$: "youni.works/web/graphic",
	use: {
		package$view: "youni.works/web/view"
	},
	Graphic: {
		super$: "use.view.Viewer",
		view: function(model) {
			let view = this.owner.window.document.createElementNS("http://www.w3.org/2000/svg", this.viewName);
			this.control(view, model);
			return view;
		}
	},
	Shape: {
		super$: "Graphic",
	},
	GraphicContext: {
		super$: "Graphic",
		viewName: "svg",
		cellSize: 1,
		move: function(shape, x, y) {
			let cell = this.cellSize;
			x = x - x % cell;
			x = x - shape.getAttribute("width") / 2;
			y = y - y % cell;
			y = y - shape.getAttribute("height") / 2;
			console.log(x, y);
			shape.setAttribute("x", x);
			shape.setAttribute("y", y);		
		},
		extend$action: {
			MouseMove: function(on, event) {
				if (event.buttons == 1 && STATE.active) {
					if (STATE.connect) {
						on.style.cursor = "crosshair";
					} else {
						this.move(STATE.active, event.offsetX, event.offsetY);
					}
				}
			},
			MouseDown: function(on, event) {
				if (event.target.handle) {
					let shape = event.target;
					if (event.altKey) {
						let x = shape.getAttribute("x");
						let y = shape.getAttribute("y");
						STATE.connect = this.part.connector.create(this, x, y);
					}
					STATE.active = shape;
				}
			},
			MouseUp: function(on, event) {
				if (event.altKey) {
					if (STATE.connect) {
						if (STATE.active) {
							
						} else {
							console.log("No active item.");
						}
					} else {
						let rect = this.part.handle.create(this, event.offsetX, event.offsetY);
						on.append(rect);						
					}
				}
				STATE.active = null;
				STATE.connect = null;
				on.style.cursor = "default";
			}
		},
		after$initialize: function(conf) {
			STATE = this.sys.extend();
			STATE.active = null;
		}
	}
}