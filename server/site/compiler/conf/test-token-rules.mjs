export default
{
	package$: false,
	package$parser: "youni.works/compiler/parser",
	main: {
		type$: "parser.Choice",
		choice: [
			{use$: "ws"},
			{use$: "comment"},
			{use$: "number"},
			{use$: "string"},
			{use$: "word"},
			{use$: "push"},
			{use$: "pop"},
			{use$: "pn"}
		]
	},
	ws: {
		type$: "parser.Choice",
		choice: " \t\r\n"
	},
	comment: {
		type$: "parser.Sequence",
		sequence: [
			{use$: "commentStart"},
			{
				type$: "parser.Choice",
				negate: true,
				choice: [
					{use$: "commentEnd"}
				]
			},
			{use$: "commentEnd"}
		]
	},
	number: {
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
				},
				{
					type$: "parser.Sequence",
					max: 1,
					sequence: [
						".",
						{
							type$: "parser.Choice",
							choice: "0123456789",
							min: 1
						},
						{
							type$: "parser.Sequence",
							max: 1,
							sequence: [
								{
									type$: "parser.Choice",
									min: 1,
									max: 1,
									choice: "Ee"
								},
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
							]
						}
					]
				}
			]
		}
	},
	string: {
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
	},
	word: {
		type$: "parser.Production",
		name: "word",
		expr: {
			type$: "parser.Sequence",
			sequence: [
				{
					use$: "letter",
				},
				{
					type$: "parser.Choice",
					choice: [
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
	push: {
		type$: "parser.Production",
		name: "push",
		expr: {
			type$: "parser.Choice",
			min: 1,
			max: 1,
			choice: "{(["
		}
	},
	pop: {
		type$: "parser.Production",
		name: "pop",
		expr: {
			type$: "parser.Choice",
			min: 1,
			max: 1,
			choice: "})]"
		}
	},
	pn: {
		type$: "parser.Production",
		name: "pn",
		expr: {
			type$: "parser.Choice",
			min: 1,
			max: 1,
			choice: ";,:.@#^*/%+-<=>!&|~?"
		}
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
	}
}
