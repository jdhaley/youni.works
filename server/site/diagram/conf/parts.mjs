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
							template: `
								<defs>
								    <marker id="marker.circle" markerWidth="8" markerHeight="8" refX="5" refY="5">
								        <circle cx="5" cy="5" r="3" style="stroke: none; fill:green;"/>
								    </marker>
								    <marker id="marker.arrow" markerWidth="15" markerHeight="10" refX="15" refY="5" orient="auto">
								        <path d="M0,0 L15,5 L0, 10" style="stroke: slateGray; stroke-linejoin: miter; fill: none" />
								    </marker>
								</defs>
							`
						}
					},
					extend$shortcut: {
					},
					control: function(view) {
						this.super("control", view);
						view.sense("event", "KeyDown");
						view.sense("event", "Input");
						view.sense("event", "FocusOut");
						view.sense("event", "Click");
						view.sense("event", "DblClick");
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
