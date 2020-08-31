export default {
	Album: [
		{
			name: "region"
			size: 3
		},
		{
			name: "era",
			size: 2
		},
		{
			name: "watermarks",
			type: "map*Watermark"
		},
		{
			name: "designs",
			type: "map*Design"
		},		
		{
			name: "issues",
			type: "array*Issue"
		}
	],
	Watermark: [
		{
			name: "image",
			width: 8
		}
	],
	Design: [
		{
			name: "shape",
			width: 8
		},
		{
			name: "width",
			type: "number",
			width: 4
		},
		{
			name: "height",
			type: "number",
			width: 4
		},
		{
			name: "image",
			width: 8
		}
	],
	Issue: [
		{
			name: "title",
			type: "div"
		},
		{
			name: "printings",
			type: "array*Printing",
		},
		{
			name: "varieties",
			type: "array*Variety"
		}
	],
	Printing: [
		{
			name: "seq",
			size: 4,
		},
		{
			name: "method",
			size: 6,
		},
		{
			name: "watermark",
			size: 6,
		},
		{
			name: "seperation",
			size: 10,
		}
	],
	Variety: [
		{
			name: "design",
			size: 6,
		},
		{
			name: "variety",
			size: 2
		},
		{
			name: "printing",
			size: 3
		},
		{
			name: "denom",
			size: 8
		},
		{
			name: "colors",
			size: 16
		},
		{
			name: "subject",
			size: 16
		},
		{
			name: "issued",
			size: 8
		},
		{
			type: "div",
			name: "title",
			size: 16
		},
		{
			type: "div",
			name: "caption",
			size: 16
		}
	]
}