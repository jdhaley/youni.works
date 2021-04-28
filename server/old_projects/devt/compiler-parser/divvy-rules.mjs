import rule from "../util/ruleBuilder.mjs";

export default {
	package$: false,
	package$parser: "youni.works/compiler/parser",
	main: rule.choice(["primary", "any"], "*"),
	primary: rule.choice([
		rule.create("list", branch("(", ")")), 
		rule.create("object", branch("{", "}")),
		rule.create("array", branch("[", "]")),
		rule.match("number"),
		rule.match("string"),
		rule.match("word"),
		rule.match("op")
	]),
	any: rule.match()
}

function branch(start, end) {
	return rule.sequence([
		rule.filter("pn", start),
		rule.sequence(["primary"], "*"),
		rule.filter("pn", end)
	]);	
}
