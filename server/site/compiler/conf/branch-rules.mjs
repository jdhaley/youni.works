import rule from "../util/ruleBuilder.mjs";

export default {
	package$: false,
	package$parser: "youni.works/compiler/parser",
	main: rule.choice(["statement", rule.match()], "*"),
	statement: rule.choice(["pair", "expr", "primary"]),
	pair: rule.create("pair",
		rule.sequence([
			rule.choice(["expr", "primary"]),
			rule.filter("pn", ":"),
			rule.choice(["pair", "expr", "primary"], "?")
		])
	),
	expr: rule.create("expr",
		rule.sequence([
			"primary",
			"primary",
			rule.sequence(["primary"], "*")
		])
	),
	primary: rule.choice([
		"fn",
		"list",
		"body",
		"array",
		rule.match("number"),
		rule.match("string"),
		rule.match("word"),
		rule.match("op")
	]),
	fn: rule.create("fn",
		rule.choice([
			rule.sequence([
				rule.match("word", "function", "?"),
				rule.match("word", "", "?"),
				"list", 
				"body"
			]),
			rule.sequence([
				rule.choice(["list", rule.match("word")], "?"),
				rule.match("op", "=>"),
				rule.choice(["expr", "primary"], "?")
			])
		])
	),
	list: branch("list", "(", ")"), 
	body: branch("body", "{", "}"),
	array: branch("array", "[", "]"),
}

function branch(name, down, up) {
	return rule.create(name,
		rule.sequence([
			rule.filter("down", down),
			rule.choice([
				"statement",
				rule.match("up", up, "~")
			], "*"),
			rule.filter("up", up)
		])
	);
}
