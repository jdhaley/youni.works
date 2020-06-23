let STATE;

export default {
	package$: "youni.works/web/graphic",
	use: {
		package$view: "youni.works/web/view"
	},
	model: {
		Node: {
			type: "",
			x: 0,
			y: 0,
			w: 0,
			h: 0,
			arcs: []
		},
		Arc: {
			toNode: null,
			type: "",
			spline: []
		}
	},
	Graphic: {
		super$: "use.view.Viewer",
		view: function(model) {
			let view = this.owner.window.document.createElementNS("http://www.w3.org/2000/svg", this.viewName);
			this.control(view, model);
			return view;
		}
	},
	Group: {
		super$: "Graphic",
		create: function(g, x, y) {
			let cell = g.cellSize;
			let rect = this.view();
			rect.handle = true;
			x -= x % cell;
			y -= y % cell;
			rect.setAttribute("x", x - this.width / 2);
			rect.setAttribute("y", y - this.height / 2);
			rect.setAttribute("width", this.width);
			rect.setAttribute("height", this.height);
			rect.setAttribute("fill", this.fill);
			rect.setAttribute("stroke", this.stroke);
			this.control(rect);
			return rect;										
		}
	},
	Connector: {
		super$: "Graphic",
		create: function(g, x, y) {
			let line = this.view();
			line.connector = true;
			line.setAttribute("x1", x);
			line.setAttribute("y1", y);
			line.setAttribute("stroke", this.stroke);
			this.control(line);
			return line;										
		},
		arc: function(line, x, y) {
			line.setAttribute("x2", x);
			line.setAttribute("y2", y);
			return line;										
		}			
	},
	GraphicContext: {
		super$: "Graphic",
		viewName: "svg",
		cellSize: 1,
		move: function(shape, x, y) {
			let cell = this.cellSize;
			x = x - x % cell;
			y = y - y % cell;
			x = x - shape.getAttribute("width") / 2;
			y = y - shape.getAttribute("height") / 2;
			console.log(x, y);
			shape.setAttribute("x", x);
			shape.setAttribute("y", y);		
		},
		extend$action: {
			MouseMove: function(on, event) {
				if (event.buttons == 1 && STATE.selection) {
					if (STATE.connect) {
						on.style.cursor = "crosshair";
					} else {
						this.move(STATE.selection, event.offsetX, event.offsetY);
					}
				}
			},
			MouseDown: function(on, event) {
				if (event.target.handle) {
					let shape = event.target;
					if (STATE.selection == shape) {
						//Toggle Selection
						STATE.selection = null;
						return;
					}
					if (event.altKey) {
						let x = shape.getAttribute("x");
						let y = shape.getAttribute("y");
						STATE.connect = this.part.connector.create(this, x, y);
					}
					STATE.selection = shape;
				} else {
					STATE.selection = null;
				}
			},
			MouseUp: function(on, event) {
				if (event.altKey) {
					if (STATE.connect) {
						if (STATE.selection) {
							
						} else {
							console.log("No active item.");
						}
					} else {
						let rect = this.part.handle.create(this, event.offsetX, event.offsetY);
						on.append(rect);						
					}
				}
				STATE.selection = null;
				STATE.connect = null;
				on.style.cursor = "default";
			}
		},
		after$initialize: function(conf) {
			STATE = this.sys.extend();
			STATE.selection = null;
		}
	}
}