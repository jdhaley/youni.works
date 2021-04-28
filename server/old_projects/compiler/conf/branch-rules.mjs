import rule from "../util/ruleBuilder.mjs";

export default {
	package$: false,
	package$parser: "youni.works/compiler/parser",
	main: rule.choice([
		"branch",
		"any"
	], "*"),
	any: rule.append(rule.match()),
	branch: rule.choice([
		statement("if"),
		statement("while"),
		statement("for"),
		statement("switch"),
		rule.create("fn",
			rule.sequence([
				rule.match("id", "function", "?"),
				rule.expr(rule.append(rule.match("id")), "?"),
				"list",
				"body"
			])
		),
		rule.create("object",
			rule.sequence([
				rule.append(rule.match("id")),
				"body"
			])
		),
		"list",
		"body",
		"array"
	]),
	list: branch("list", "(", ")"), 
	body: branch("body", "{", "}"),
	array: branch("array", "[", "]")
//	divvy: rule.choice([
//		rule.divvy("list", "list", ","),
//		rule.divvy("body", "object", ","),
//		rule.divvy("array", "array", ","),
//		rule.match()
//	], "*")
//	primary: rule.choice([
//	//	"fn",
//		"list",
//		"body",
//		"array",
//		rule.match("pn"),
//
//		rule.match("number"),
//		rule.match("string"),
//		rule.match("word"),
//		rule.match("op")
//	]),
//	list: branch("list", "(", ")"), 
//	body: branch("body", "{", "}"),
//	array: branch("array", "[", "]"),
//	statement: rule.choice(["pair", "expr", "primary"]),
//	pair: rule.create("pair",
//		rule.sequence([
//			rule.choice(["expr", "primary"]),
//			rule.filter("pn", ":"),
//			rule.choice(["pair", "expr", "primary"], "?")
//		])
//	),
//	expr: rule.create("expr",
//		rule.sequence([
//			"primary",
//			"primary",
//			rule.sequence(["primary"], "*")
//		])
//	),
//	fn: rule.choice([
//		rule.create("fn",
//			rule.sequence([
//				rule.filter("word", "function", "?"),
//				rule.match("word", "", "?"),
//				"list", 
//				"body"
//			])
//		),
//		rule.create("fn",
//			rule.sequence([
//				rule.choice(["list", rule.match("word")], "?"),
//				rule.match("op", "=>"),
//				rule.choice(["expr", "primary"], "?")
//			])
//		)
//	]),
}

function statement(name) {
	return rule.create(name,
		rule.sequence([
			rule.match("id", name),
			"list",
			rule.expr("body", "?")
		])
	)
}

function branch(name, down, up) {
	return rule.create(name,
		rule.sequence([
			rule.match("pn", down),
			rule.choice([
				"branch",
				rule.append(rule.match("pn", up, "~"))
			], "*"),
			rule.match("pn", up)
		])
	);
}
