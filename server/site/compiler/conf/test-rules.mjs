export default
{
	package$: false,
	package$parser: "youni.works/compiler/parser",
	test: {
		type$: "parser.Rule",
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
								use$: "lower"
							},
							{
								"type$": "parser.Choice",
								"exprs": [
									{
										use$: "lower"
									},
									{
										use$: "upper"
									},
									{
										use$: "letterLike"
									},
									{
										use$: "digit"
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
