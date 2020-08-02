import rule from "../util/ruleBuilder.mjs";

export default {
	package$: false,
	package$parser: "youni.works/compiler/parser",
	main: rule.pipe(
		rule.choice([
			"branch",
			rule.match()
		], "*"),
		"group"
	),
	branch: rule.choice([
		branch("list", "(", ")"), 
		branch("body", "{", "}"),
		branch("array", "[", "]")
	]),
	group: rule.choice([
		rule.create("fn",
			rule.sequence([
//				rule.filter("id", "function", "?"),
//				rule.match("id", "", "?"),
				rule.match("list"),
				rule.match("body")
			])
		),
		rule.create("object",
			rule.sequence([
				rule.match("id"),
				rule.match("body")
			])
		),
		rule.down("group"),
		rule.match()
	], "*"),	
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

function branch(name, down, up) {
	return rule.create(name,
		rule.sequence([
			rule.filter("pn", down),
			rule.choice([
				"branch",
				rule.match("pn", up, "~")
			], "*"),
			rule.filter("pn", up)
		])
	);
}
