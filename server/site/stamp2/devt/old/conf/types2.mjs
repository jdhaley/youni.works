export default {
	Currency: {
		region: "Region",
		from: "date",
		to: "date",
		name: "string",
		symbols: "string",
		symbolShortcuts: "string", //Should map 1:1 to a symbol character.
	},
	Region: {
		id: {
			width: 4
		},
		name: {
			width: 20
		},
		location: {
			type: "string",
			set: ["Europe", "North America", "South America", "Africa", "Asia", "Antartica", "Pacific", "Indian Ocean", "Atlantic Ocean", "Carribean"]
		},
		relatedRegions: {
			type: "RelatedRegion*"
		},
		watermarks: {
			type: "Watermark*"
		}
	},
	Era: {
		region: {
			type: "Region"
		},
		from: {
			type: "Date"
		},
		to: {
			type: "Date"
		},
		currency: {
		}
	},
	RelatedRegion: {
		relation: {
			type: "string",
			set: ["Authority", "Successor"]
		},
		region: {
			type: "Region"
		}
	},
	Section: {
		era: "Era",
		title: "string",
		designs: "Design*",
		
		{
			name: "issues",
			type: "array*Issue"
		}
	},
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
			maxLength: 6
		},
		{
			name: "variety",
			title: "Major",
			size: 4,
			maxLength: 3
		},
		{
			name: "printing",
			title: "Minor",
			size: 4,
			maxLength: 4
		},
		{
			name: "denom",
			title: "Denomination",
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