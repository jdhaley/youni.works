import rule from "../util/ruleBuilder.mjs";

let UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let LOWER = "abcdefghijklmnopqrstuvwxyz";
let LETTER_LIKE = "$_";
let LETTER = rule.charset(LOWER + UPPER + LETTER_LIKE);

let QUOTE = rule.charset("\"");

let DIGIT = rule.charset("0123456789");
let DIGITS = rule.sequence(DIGIT, rule.many(DIGIT));

export default
{
	package$: false,
	package$parser: "youni.works/compiler/parser",
	main: rule.many(rule.choice(
		{use$: "ws"},
		{use$: "comment"},
		{use$: "number"},
		{use$: "string"},
		{use$: "word"},
		{use$: "pn"},
		{use$: "op"}
	)),
	ws: rule.many(rule.charset(" \t\r\n")),
	comment: rule.sequence(
		rule.charseq("/*"),
		rule.many(rule.negate(rule.charseq("*/"))),
		rule.charseq("*/")
	),
	number: rule.create("number", rule.sequence(
		rule.opt(rule.charset("+-")),
		DIGITS,
		rule.opt(rule.sequence(
			rule.charset("."),
			DIGITS,
			rule.opt(rule.sequence(
				rule.charset("eE"),
				rule.opt(rule.charset("+-")),
				DIGITS,					
			))
		)),
	)),
	string: rule.create("string", rule.sequence(
		QUOTE,
		rule.many(rule.choice(
			rule.charseq("\\\""),
			rule.negate(rule.charseq("\""))
		)),
		QUOTE
	)),
	word: rule.create("word", rule.sequence(
		LETTER,
		rule.many(rule.choice(LETTER, DIGIT))
	)),
	pn: rule.create("pn", rule.charset("({[)}]")),
	op: rule.create("op", rule.charset(";,:.@#^*/%+-<=>!&|~?"))
}
