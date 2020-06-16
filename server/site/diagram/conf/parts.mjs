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
							type$: "use.graphic.Graphic",
							cellSize: 20,
							part: {
								rect: {
									type$: "use.graphic.Shaper",
									viewName: "rect",
									width: 4,
									height: 2,
									fill: "none",
									stroke: "green",
									draw: function(g, x, y) {
										let cell = g.cellSize;
										let rect = this.view();
										x -= x % cell;
										y -= y % cell;
										rect.setAttribute("x", x - this.width * cell / 2);
										rect.setAttribute("y", y - this.height * cell / 2);
										rect.setAttribute("width", this.width * cell);
										rect.setAttribute("height", this.height * cell);
										rect.setAttribute("fill", this.fill);
										rect.setAttribute("stroke", this.stroke);
										return rect;										
									}
								},
								ellipse: {
									type$: "use.graphic.Shaper",
									viewName: "ellipse"									
								}
							},
							action: {
								Click: function(on, event) {					
									if (event.ctrlKey) {
										let rect = this.part.rect.draw(this, event.offsetX, event.offsetY);
										on.append(rect);
									}
								}
							}
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
					},
					after$initialize: function(conf) {
					}
				}
			}
		}
	}
}
