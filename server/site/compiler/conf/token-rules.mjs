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
	main: rule.choice(["ws", "comment", "number", "string", "word", "op", "pn"], "*"),
	ws: rule.choice(" \t\r\n", "*"),
	comment: rule.sequence([
		rule.sequence("/*"),
		rule.sequence("*/", "~*"),
		rule.sequence("*/", "?") // Compilation to check for unterminated comment.
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
	string: rule.create("string",
		rule.sequence([
			rule.sequence("\""),
			rule.choice([
				rule.sequence("\\\""),
				rule.sequence("\"", "~")
			], "*"),
			rule.sequence("\"", "?") // Compilation to check for unterminated string.
		])
	),
	word: rule.create("word",
		rule.sequence([
			Letter,
			rule.choice([Letter, Digit], "*")
		])
	),
	pn: rule.create("pn",
		rule.choice(",;:({[)}]")
	),
	op: rule.create("op",
		rule.choice(".@#^*/%+-<=>!&|~?")
	)
}
