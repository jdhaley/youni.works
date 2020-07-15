export default
{
	package$: false,
	package$parser: "youni.works/compiler/parser",
	main: {
		type$: "parser.Choice",
		choice: [
			{
				type$: "parser.Production",
				name: "array",
				expr: {
					type$: "parser.Sequence",
					sequence: [
						{
							type$: "parser.Match",
							suppress: true,
							nodeName: "pn",
							nodeText: "[",
							min: 1,
							max: 1
						},
						{
							type$: "parser.Match",
							nodeName: "pn",
							nodeText: "]",
							negate: true
						},
						{
							type$: "parser.Match",
							suppress: true,
							nodeName: "pn",
							nodeText: "]",
							min: 1,
							max: 1
						}
					]
				}
			},
			{
				type$: "parser.Match",
				max: 1
			}
		]
	}
}
