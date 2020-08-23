export default {
	package$: "youni.works/graphic/layout",
	use: {
		package$control: "youni.works/base/control"
	},
	Variety: {
		super$: "use.control.Record",
		//Design		Variety		Denom.	Colors		Subject	Title		Caption
		fields: [
			{
				super$: "use.control.Field",
				name: "design",
				size: 6,
			},
			{
				super$: "use.control.Field",
				name: "variety",
				size: 4
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
	Varieties: {
		super$: "use.control.Table",
		type$record: "Variety"
	}
}