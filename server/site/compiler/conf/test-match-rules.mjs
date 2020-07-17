import rule from "../util/ruleBuilder.mjs";

function branch(start, end) {
	return rule.sequence(
		rule.remove(rule.match("push", start)),
		rule.many(rule.sequence({use$: "primary"})),
		rule.remove(rule.match("pop", end))
	);	
}

export default
{
	package$: false,
	package$parser: "youni.works/compiler/parser",
	main: rule.many(rule.choice({use$: "primary"}, rule.match(""))),
	primary: rule.choice(
		rule.create("list", branch("(", ")")), 
		rule.create("object", branch("{", "}")),
		rule.create("array", branch("[", "]")),
		rule.match("number"),
		rule.match("string"),
		rule.match("word"),
		rule.match("pn")
	)
}
