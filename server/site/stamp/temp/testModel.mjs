export default {
	watermarks: {
		"GB-V2R": {
		}
	},
	designs: {
		GB1A: {
			shape: "rectangle",
			width: 22,
			height: 25,
			image: "GB1A1"
		},
		GB1D: {
			shape: "rectangle",
			width: 22,
			height: 25,
			image: "GB1D1"
		}
	},
	issues: [
		{
			title: "1840. First Issue",
			printings: [
				{
					seq: "a",
					method: "Engraved",
					watermark: "GB-V2R",
					seperation: "imperf"
				},
				{
					seq: "b",
					method: "Engraved",
					watermark: "GB-V2R",
					seperation: "perf 12 12"
				}
			],
			varieties: [
				{
					design: "GB1A",
					variety: "1",
					denom: "1d",
					colors: "black",
					image: "GB1A"
				},
				{
					design: "GB1A",
					variety: "2",
					denom: "2d",
					colors: "blue"
				}
			]
		},
		{
			title: "1887. Jubilee",
			printings: [
			],
			varieties: [
				{
					design: "GB1D",
					variety: "1",
					denom: "1d",
					colors: "black"
				},
				{
					design: "GB1D",
					variety: "2",
					denom: "2d",
					colors: "blue"
				},
				{
					design: "GB1D",
					variety: "3",
					denom: "2 1/2d",
					colors: "green"
				},
				{
					design: "GB1D",
					variety: "4",
					denom: "3d",
					colors: "red"
				}
			]
		}
	]
}