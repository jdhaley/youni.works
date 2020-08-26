export default {
	package$: "youni.works/album/input",
	use: {
		package$control: "youni.works/base/control"
	},
/*
Printing {
	printer: "",
	method: "",
	paper: "",
	watermark: "",
	separation: "",
	tagging: "",
	imprint: "",
	image: ""
}
*/
	Printing: {
		super$: "use.control.Record",
		fields: [
			{
				super$: "use.control.Field",
				name: "seq",
				size: 4,
			},
			{
				super$: "use.control.Field",
				name: "method",
				size: 6,
			},
			{
				super$: "use.control.Field",
				name: "watermark",
				size: 6,
			},
			{
				super$: "use.control.Field",
				name: "seperation",
				size: 10,
			}	
		]
	},
	Variety: {
		super$: "use.control.Record",
		fields: [
			{
				super$: "use.control.Field",
				name: "design",
				size: 6,
			},
			{
				super$: "use.control.Field",
				name: "variety",
				size: 2
			},
			{
				super$: "use.control.Field",
				name: "printing",
				size: 3
			},
			{
				super$: "use.control.Field",
				name: "denom",
				size: 8
			},
			{
				super$: "use.control.Field",
				name: "colors",
				size: 16
			},
			{
				super$: "use.control.Field",
				name: "subject",
				size: 16
			},
			{
				super$: "use.control.Field",
				name: "issued",
				size: 8
			},
			{
				super$: "use.control.Field",
				name: "title",
				size: 16
			},
			{
				super$: "use.control.Field",
				name: "caption",
				size: 16
			}
		]
	},
	Printings: {
		super$: "use.control.Table",
		type$record: "Printing"
	},
	Varieties: {
		super$: "use.control.Table",
		type$record: "Variety"
	}
}