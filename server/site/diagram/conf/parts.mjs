export default {
	package$: "youni.works/diagram/parts",
	use: {
		package$view: "youni.works/web/view",
		package$ui: "youni.works/web/ui",
		package$graphic: "youni.works/web/graphic"
	},
	public: {
		body: {
			type$: "use.view.Viewer",
			viewName: "body",
			viewType: "composite",
			part: {
				main: {
					type$: "use.ui.Main",
					part: {
						ribbon: {
							type$: "use.ui.Ribbon",
							viewName: "nav"
						},
						article: {
							type$: "use.graphic.GraphicContext",
							cellSize: 20,
							type$part: "shapes",
						}
					},
					extend$shortcut: {
					},
//					extend$action: {
//						Input: DEFAULT,
//						Cut: DEFAULT,
//						Copy: DEFAULT,
//						Paste: DEFAULT,
//						Delete: DEFAULT,
//						Insert: DEFAULT,
//						Erase: DEFAULT,
//						Split: DEFAULT,
//						Join: DEFAULT,
//						Promote: DEFAULT,
//						Demote: DEFAULT,
//						Character: DEFAULT,
//					},
					after$control: function(view) {
						view.sense("event", "Click");
						view.sense("event", "KeyDown");
						view.sense("event", "MouseDown");
						view.sense("event", "MouseUp");
						view.sense("event", "MouseMove");
					},
					after$initialize: function(conf) {
					}
				}
			}
		}
	},
	shapes: {
		rect: {
			type$: "use.graphic.Shape",
			viewName: "rect",
			width: 80,
			height: 40,
			fill: "white",
			stroke: "green",
			draw: function(g, x, y) {
				let cell = g.cellSize;
				let rect = this.view();
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
		ellipse: {
			type$: "use.graphic.Shape",
			viewName: "ellipse"									
		}
	}
}
