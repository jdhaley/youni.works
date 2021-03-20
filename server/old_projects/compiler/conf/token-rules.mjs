import rule from "../util/ruleBuilder.mjs";

let UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let LOWER = "abcdefghijklmnopqrstuvwxyz";
let LETTER_LIKE = "$_";
let DIGIT = "0123456789";

let Letter = rule.choice(LOWER + UPPER + LETTER_LIKE);
let Digit = rule.choice(DIGIT);
let Digits = rule.sequence([Digit, rule.choice(DIGIT, "*")]);

export default
{
	package$: false,
	package$parser: "youni.works/compiler/parser",
	main: rule.choice([
		"token",
		"other"
	], "*"),
	token: rule.choice([
		"ws", "comment",
		"string", "number", "id",
		"op", "pn"
	]),
	other: rule.create("other",
		rule.expr("token", "~*")
	),
	ws: rule.choice(" \t\r\n", "*"),
	comment: rule.choice([
		rule.sequence([
			rule.sequence("//"),
			rule.sequence("\n", "~*"),
			rule.sequence("\n")
		]),
		rule.sequence([
			rule.sequence("/*"),
			rule.sequence("*/", "~*"),
			rule.sequence("*/", "?") // Compilation to check for unterminated comment.
		])
	]),
	string: rule.choice([
		string("\""),
		string("'"),
		string("`")
	]),
	number: rule.create("number",
		rule.sequence([
			rule.choice("+-", "?"),
			Digits,
			rule.sequence([
				rule.sequence("."),
				Digits,
				rule.sequence([
					rule.choice("eE"),
					rule.choice("+-", "?"),
					Digits				
				], "?")
			], "?")
		])
	),
	id: rule.create("id",
		rule.sequence([
			Letter,
			rule.choice([Letter, Digit, rule.sequence(".")], "*")
		])
	),
	pn: rule.create("pn",
		rule.choice(",;:({[)}].")
	),
	op: rule.create("op",
		rule.choice("@#^*/%+-<=>!&|~?", "*")
	)
}

function string(pn) {
	return rule.create("string",
		rule.sequence([
			rule.sequence(pn),
			rule.choice([
				rule.sequence("\\" + pn),
				rule.sequence(pn, "~")
			], "*"),
			rule.sequence(pn, "?") // Compilation to check for unterminated string.
		])
	);
}