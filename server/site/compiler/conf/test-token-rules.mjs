export default
{
	package$: false,
	package$parser: "youni.works/compiler/parser",
	main: {
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
					type$: "parser.Sequence",
					sequence: [
						{
							use$: "commentStart",
						},
						{
							type$: "parser.Choice",
							choice: [
								{use$: "commentEnd"}
							],
							negate: true
						},
						{
							use$: "commentEnd"
						}
					]
				},
				{
					type$: "parser.Production",
					name: "number",	
					expr: {
						type$: "parser.Sequence",
						sequence: [
							{
								type$: "parser.Choice",
								choice: "+-",
								max: 1
							},
							{
								type$: "parser.Choice",
								choice: "0123456789",
								min: 1
							}
							//Just do integers for now.
						]
					}
				},
				{
					type$: "parser.Production",
					name: "pn",
					expr: {
						type$: "parser.Choice",
						min: 1,
						max: 1,
						choice: "{}()[];,:.@#^*/%+-<=>!&|~?"
					}
				},
				{
					type$: "parser.Production",
					name: "word",
					expr: {
						"type$": "parser.Sequence",
						"sequence": [
							{
								use$: "letter",
							},
							{
								"type$": "parser.Choice",
								"choice": [
									{
										use$: "letter"
									},
									{
										use$: "digit"
									}
								]
							}
						]
					}
				},
				{
					type$: "parser.Sequence",
					sequence: [
						"\"",
						{
							type$: "parser.Production",
							name: "string",
							expr: {
								type$: "parser.Choice",
								choice: [
									{
										type$: "parser.Sequence",
										sequence: "\\\""
									},
									{
										type$: "parser.Choice",
										choice: "\"",
										negate: true
									}
								]
							}
						},
						"\""
					],
					max: 1
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
	},
	letter: {
		type$: "parser.Choice",
		choice: [
			{
				use$: "lower"
			},
			{
				use$: "upper"
			},
			{
				use$: "letterLike"
			}
		]
	},
	commentStart: {
		type$: "parser.Sequence",
		sequence: "/*",
		min: 1,
		max: 1
	},
	commentEnd: {
		type$: "parser.Sequence",
		sequence: "*/",
		min: 1,
		max: 1
	},

}
