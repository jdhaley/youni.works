export default {
	Node: {
		type: "youni.works/shape/Shape"
		tag: "",
		at: {
		},
		to: {
		}
	},
	Example: {
		type: "youni.works/shape/Shape",
		tag: "div",
		at: {
			id: "",
			etc: "etc"
		},
		data: {
		},
		styles: ["widget", "cell", {
			stroke: {
				path: "", //no path is rect
				color: "", //no color is black
				dash: "", //no dash is solid
				width: 1,
				from: "", // start arrowhead
				to: "", //end arrowhead
			},
			fill: {
				color: "" //
			},
			text: {
			},
			box: {
				x: 0,
				y: 0,
				width: 10,
				height: 10
			}
		}],
		//Content: string, number, object = node, array = nodes.
		content: [
			"text", {type: "person", at: {abc: 10}, content: []}, "etc"
		]
		//styles, classes, dataSet
	}
}