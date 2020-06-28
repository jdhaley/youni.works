export default {
	package$: "youni.works/diagram/parts",
	use: {
		package$view: "youni.works/web/view",
		package$ui: "youni.works/web/ui",
		package$graphic: "youni.works/web/graphic",
		package$diagram: "youni.works/diagram/diagram"
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
					control: function(view) {
						this.super("control", view);
						view.sense("event", "Click");
						view.sense("event", "KeyDown");
						view.sense("event", "MouseDown");
						view.sense("event", "MouseUp");
						view.sense("event", "MouseMove");
					}
				}
			}
		}
	},
	shapes: {
		node: {
			type$: "use.diagram.Node",
			width: 80,
			height: 40,
		},
		connector: {
			type$: "use.diagram.Arc",
		},
		text: {
			type$: "use.diagram.Text",
			width: 80,
			height: 40,
		}
	}
}
