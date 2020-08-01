import rule from "../util/ruleBuilder.mjs";

export default {
	package$: false,
	package$parser: "youni.works/compiler/parser",
	branch: rule.choice(["dobranch", rule.match()], "*"),
	fn: rule.choice([
		rule.create("fn",
			rule.sequence([
				rule.filter("id", "function", "?"),
				rule.match("id", "", "?"),
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
		rule.down("fn"),
		rule.match()
	], "*"),	
	dobranch: rule.choice([
		branch("list", "(", ")"), 
		branch("body", "{", "}"),
		branch("array", "[", "]"),		
	]),
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
			rule.filter("down", down),
			rule.choice([
				"dobranch",
				rule.match("up", up, "~")
			], "*"),
			rule.filter("up", up)
		])
	);
}


//rule.pipe(
//	{
//		type$: "parser.Divvy",
//		name: name,
//		pn: ","
//	}
//);
