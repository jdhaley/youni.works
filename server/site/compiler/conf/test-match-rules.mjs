export default
{
	package$: false,
	package$parser: "youni.works/compiler/parser",
	main: {
		type$: "parser.Choice",
		choice: [
			{use$: "primary"},
			{use$: "any"}
		]
	},
	primary: {
		type$: "parser.Choice",
		choice: [
			{use$: "list"},
			{use$: "object"},
			{use$: "array"},
			{
				type$: "parser.Match",
				nodeName: "number"
			},
			{
				type$: "parser.Match",
				nodeName: "string"
			},
			{
				type$: "parser.Match",
				nodeName: "word"
			},
			{
				type$: "parser.Match",
				nodeName: "pn"
			}
		]
	},
	any: {
		type$: "parser.Match",
		min: 1,
		max: 1
	},
	list: {
		type$: "parser.Production",
		name: "list",
		expr: {
			type$: "parser.Sequence",
			sequence: [
				{
					type$: "parser.Match",
					suppress: true,
					nodeName: "push",
					nodeText: "(",
					min: 1,
					max: 1
				},
				{use$: "primary"},
				{
					type$: "parser.Match",
					suppress: true,
					nodeName: "pop",
					nodeText: ")",
					min: 1,
					max: 1
				}
			]
		}
	},
	object: {
		type$: "parser.Production",
		name: "object",
		expr: {
			type$: "parser.Sequence",
			sequence: [
				{
					type$: "parser.Match",
					suppress: true,
					nodeName: "push",
					nodeText: "{",
					min: 1,
					max: 1
				},
				{use$: "primary"},
				{
					type$: "parser.Match",
					suppress: true,
					nodeName: "pop",
					nodeText: "}",
					min: 1,
					max: 1
				}
			]
		}
	},
	array: {
		type$: "parser.Production",
		name: "array",
		expr: {
			type$: "parser.Sequence",
			sequence: [
				{
					type$: "parser.Match",
					debug: true,
					suppress: true,
					nodeName: "push",
					nodeText: "[",
					min: 1,
					max: 1
				},
				{use$: "primary"},
				{
					type$: "parser.Match",
					suppress: true,
					nodeName: "pop",
					nodeText: "]",
					min: 1,
					max: 1
				}
			]
		}
	}
}
