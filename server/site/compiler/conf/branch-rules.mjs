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
		"object",
		"array",
		rule.match("number"),
		rule.match("string"),
		rule.match("word"),
		rule.match("op")
	]),
	fn: rule.create("fn",
		rule.sequence([
			rule.match("word", "function", "?"),
			rule.match("word", "", "?"),
			"list", 
			branch("body", "{", ";", "}"),
		])
	),
	list: branch("list", "(", ",", ")"), 
	object: branch("object", "{", ",", "}"),
	array: branch("array", "[", ",", "]"),
}

function statements(pn, end) {
	return rule.sequence([
		rule.sequence([
			"statement",
			rule.filter("pn", pn)
		], "*"),
		rule.choice([
			"statement",
			rule.match("up", end, "~")
		], "?")
	]);
}

function branch(name, down, pn, up) {
	return rule.create(name,
		rule.sequence([
			rule.filter("down", down),
			statements(pn, up),
			rule.filter("up", up)
		])
	);
}
