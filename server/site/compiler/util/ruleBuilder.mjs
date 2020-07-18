/*

For the various expressions, the last argument is the expression and
can be:
"~?" = negate (0, 1)
"?" = (0, 1)
"~*" = negate (0, n)
"*" = (0, n)
"~" = negate (1, 1)
"" or not supplied = (1, 1)

For sequences and choices the first argument is a string or array.
When a string it is a "charseq" or "charset" rule. When an array,
it is an array of parsers/strings.  A string within an array generates
a {use$: "name"} reference.

 */
export default {
	create: function(name, expr) {
		return {
			type$: "parser.Production",
			name: name,
			expr: expr
		}		
	},
	sequence: function(sequence, expr) {
		return _expr({
			type$: "parser.Sequence",
			sequence: setRef(sequence)
		}, expr);
	},
	choice: function(choice, expr) {
		return _expr({
			type$: "parser.Choice",
			choice: setRef(choice),
		}, expr);
	},
	match: function(name, text, expr) {
		return _expr({
			type$: "parser.Match",
			nodeName: name || "",
			nodeText: text || "",
			suppress: false
		}, expr);
	},
	filter: function(name, text, expr) {
		return _expr({
			type$: "parser.Match",
			nodeName: name || "",
			nodeText: text || "",
			suppress: true
		}, expr);
	}
}

function _expr(rule, expr) {
	if (expr === undefined) expr = "";
	switch (expr) {
		case "~?":
			rule.negate = true;
			//fall
		case "?":
			rule.min = 0;
			rule.max = 1;
			return rule;
		case "~*":
			rule.negate = true;
			//fall
		case "*":
			rule.min = 0;
			rule.max = 9007199254740991;
			return rule;
		case "~":
			rule.negate = true;
			//fall
		case "":
			rule.min = 1;
			rule.max = 1;
			return rule;
		default:
			throw new Error(`Invalid expression "${expr}"`);
	}	
}

function setRef(array) {
	if (typeof array != "string") {
		for (let i = 0; i < array.length; i++) {
			if (typeof array[i] == "string") array[i] = {use$: array[i]};
		}
	}
	return array;
}