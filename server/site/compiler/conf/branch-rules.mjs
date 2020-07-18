import rule from "../util/ruleBuilder.mjs";

export default {
	package$: false,
	package$parser: "youni.works/compiler/parser",
	main: rule.choice(["statements", rule.match()], "*"),
	statements: rule.choice(["pair", "expr", "primary", "div"], "*"),
	pair: rule.create("pair",
		rule.sequence([
			//Even when there is no match, a <void> is created.
			rule.choice(["expr", "primary", rule.create("void")], "?"),
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
		branch("list", "(", ")"), 
		branch("object", "{", "}"),
		branch("array", "[", "]"),
		rule.match("number"),
		rule.match("string"),
		rule.match("word"),
		rule.match("op")
	]),
	div: rule.choice([rule.match("pn", ","), rule.match("pn", ";")]),
	fn: rule.sequence([
		rule.match("word", "function", "?"),
		rule.match("word", "", "?"),
	//	"list",
	//	"object"
	])
}

function branch(name, start, end) {
	return rule.create(name,
		rule.sequence([
			rule.filter("pn", start),
			"statements",
			rule.filter("pn", end)
		])
	);	
}
