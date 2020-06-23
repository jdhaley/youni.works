let STATE;

export default {
	package$: "youni.works/web/graphic",
	use: {
		package$view: "youni.works/web/view"
	},
	graph: {
		Node: {
			type: "",
			x: 0,
			y: 0,
			//z: 0,
			w: 0,
			h: 0,
			//d: 0,
			value: undefined
		},
		Arc: {
			type: "",
			from: null,
			to: null
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
	Connector: {
		super$: "Graphic",
		create: function(gc, from, to) {
			let line = this.view();
			line.connector = true;
			line.setAttribute("x1", from.getAttribute("x") * 1 + from.getAttribute("width") / 2);
			line.setAttribute("y1", from.getAttribute("y") * 1 + from.getAttribute("height") / 2);
			line.setAttribute("x2", to.getAttribute("x") * 1 + to.getAttribute("width") / 2);
			line.setAttribute("y2", to.getAttribute("y") * 1 + to.getAttribute("height") / 2);
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
			rect.setAttribute("stroke-dasharray", this.strokeDasharray);
			this.control(rect);
			return rect;										
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
				STATE.selection && STATE.selection.setAttribute("stroke", "slateGray");
				if (event.target.handle) {
					if (STATE.selection == event.target) {
						STATE.selection = null;
						return;
					}
					
					if (STATE.selection && event.altKey) {
						let connector = this.part.connector.create(this, STATE.selection, event.target);
						on.append(connector);
					}

					STATE.selection = event.target;
					STATE.selection.setAttribute("stroke", "green");
					
				} else {
					if (event.altKey) {
						STATE.selection = this.part.handle.create(this, event.offsetX, event.offsetY);;
						STATE.selection.setAttribute("stroke", "green");
						on.append(STATE.selection);
					}
				}
			},
			MouseUp: function(on, event) {
			}
		},
		after$initialize: function(conf) {
			STATE = this.sys.extend();
			STATE.selection = null;
		}
	}
}