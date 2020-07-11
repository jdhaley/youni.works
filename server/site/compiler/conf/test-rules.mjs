export default
{
	package$: false,
	package$parser: "youni.works/compiler/parser",
	test: {
		type$: "parser.Production",
		expr: {
			type$: "parser.Choice",
			exprs: [
				{
					type$: "parser.Choice",
					name: "ws",
					exprs: " \t\r\n"
				},
				{
					type$: "parser.Production",
					name: "pn",
					expr: {
						type$: "parser.Choice",
						max: 1,
						exprs: "()[],:#^" + "."
					}
				},
				{
					type$: "parser.Production",
					name: "name",
					expr: {
						"type$": "parser.Sequence",
						"exprs": [
							{
								"type$": "lower",
							},
							{
								"type$": "parser.Choice",
								"exprs": [
									{
										"type$": "lower"
									},
									{
										"type$": "upper"
									},
									{
										"type$": "letterLike"
									},
									{
										"type$": "digit"
									}
								]
							}
						]
					}
				}
			]
		}
	},
	upper: {
		type$: "parser.Choice",
		exprs: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	},
	lower: {
		type$: "parser.Choice",
		exprs: "abcdefghijklmnopqrstuvwxyz"
	},
	letterLike: {
		type$: "parser.Choice",
		exprs: "$_"
	},
	digit: {
		type$: "parser.Choice",
		exprs: "0123456789"
	}
}
