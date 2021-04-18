export default {
	package$: "youni.works/diagram/component",
	use: {
		package$graphic: "youni.works/web/graphic",
		package$diagram: "youni.works/diagram/diagram"
	},
	component: {
		type$: "use.graphic.GraphicContext",
		cellSize: 20,
		template: `
			<defs>
			    <marker id="marker.circle" markerWidth="8" markerHeight="8" refX="5" refY="5">
			        <circle cx="5" cy="5" r="3" style="stroke: none; fill:green;"/>
			    </marker>
			    <marker id="marker.arrow" markerWidth="15" markerHeight="10" refX="15" refY="5" orient="auto">
			        <path d="M0,0 L15,5 L0, 10" style="stroke: slateGray; stroke-linejoin: miter; fill: none" />
			    </marker>
			    <style>
				    .node, foreignobject {
						transition: all 80ms ease-out;
					}
					.node {
						fill: ghostWhite;
						stroke: slateGray;
						stroke-width: 1px;
					}
					.connector {
						stroke: slateGray;
						stroke-width: 1px;
					}
					.text {
						font-size: 14px;
						outline: 0;
						margin: 0;
						padding: 4px;
						color: slateGray;
						cursor: text;
						background: transparent;
					}
					.node:hover {
						stroke: green;
					}
					.selected, .selected:hover {
						stroke: orange;
					}
					.text:hover, .text:focus {
						color: black;
						background: white;
					}
				</style>
			</defs>
		`,
		part: {
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
			}
		}
	}
}