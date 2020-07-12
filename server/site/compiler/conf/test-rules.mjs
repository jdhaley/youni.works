export default
{
	package$: false,
	package$parser: "youni.works/compiler/parser",
	test: {
		type$: "parser.Rule",
		expr: {
			type$: "parser.Choice",
			choice: [
				{
					type$: "parser.Choice",
					name: "ws",
					choice: " \t\r\n"
				},
				{
					type$: "parser.Production",
					name: "pn",
					expr: {
						type$: "parser.Choice",
						max: 1,
						choice: "()[],:#^" + "."
					}
				},
				{
					type$: "parser.Production",
					name: "name",
					expr: {
						"type$": "parser.Sequence",
						"sequence": [
							{
								use$: "lower"
							},
							{
								"type$": "parser.Choice",
								"choice": [
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
		choice: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	},
	lower: {
		type$: "parser.Choice",
		choice: "abcdefghijklmnopqrstuvwxyz"
	},
	letterLike: {
		type$: "parser.Choice",
		choice: "$_"
	},
	digit: {
		type$: "parser.Choice",
		choice: "0123456789"
	}
}
