let SHAPE = null;

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
		extend$action: {
			MouseDown: function(on, event) {
				if (!SHAPE) SHAPE = on;
			}
		}
	},
	GraphicContext: {
		super$: "Graphic",
		viewName: "svg",
		cellSize: 1,
		extend$action: {
			Click: function(on, event) {					
				if (event.ctrlKey) {
					console.log(event);
					let rect = this.part.rect.draw(this, event.offsetX, event.offsetY);
					on.append(rect);
				}
			},
			MouseMove: function(on, event) {
				if (event.buttons == 1 && SHAPE) {
					let cell = this.cellSize;
					let x = event.offsetX;
					x = x - x % cell;
					x = x - SHAPE.getAttribute("width") / 2;
					let y = event.offsetY;
					y = y - y % cell;
					y = y - SHAPE.getAttribute("height") / 2;
					console.log(x, y);
					SHAPE.setAttribute("x", x);
					SHAPE.setAttribute("y", y);				
				}
			},
			MouseUp: function(on, event) {
				SHAPE = null;
			}
		}
	}
}