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
	expr: expr,
	sequence: function(sequence, opt) {
		return expr({
			type$: "parser.Sequence",
			sequence: useExprs(sequence)
		}, opt);
	},
	choice: function(choice, opt) {
		return expr({
			type$: "parser.Choice",
			choice: useExprs(choice),
		}, opt);
	},
	match: function match(name, rule, opt) {
		return expr({
			type$: "parser.Match",
			name: name || "",
			rule: rule || ""
		}, opt);
	},
	create: function(name, expr) {
		return {
			type$: "parser.Create",
			name: name,
			expr: useExpr(expr)
		}
	},
	append: function(expr) {
		return {
			type$: "parser.Append",
			expr: useExpr(expr)
		}
	},
	down: function(expr) {
		return {
			type$: "parser.Down",
			expr: typeof expr == "string" ? {use$: expr} : expr
		}
	},
	divvy: function(name, pn) {
		return {
			type$: "parser.Divvy",
			name: name,
			pn: pn
		}
	},
	pipe: function(...pipe) {
		return {
			type$: "parser.Pipe",
			pipeline: useExprs(pipe)
		}		
	},
}

function expr(rule, opt) {
	rule = useExpr(rule);
	switch (opt || "") {
		case "~?":
			return {
				type$: "parser.Expr",
				expr: rule,
				negate: true,
				min: 0
			}
		case "?":
			return {
				type$: "parser.Expr",
				expr: rule,
				min: 0
			}
		case "~*":
			return {
				type$: "parser.Expr",
				expr: rule,
				negate: true,
				min: 0,
				max: 9007199254740991
			}
		case "*":
			return {
				type$: "parser.Expr",
				expr: rule,
				min: 0,
				max: 9007199254740991
			}
		case "~":
			return {
				type$: "parser.Expr",
				expr: rule,
				negate: true,
			}
		case "":
			return rule;
		default:
			throw new Error(`Invalid option "${opt}"`);
	}
}


function useExpr(expr) {
	if (typeof expr == "string") expr = {use$: expr};
	return expr;
}
function useExprs(array) {
	if (typeof array != "string") {
		for (let i = 0; i < array.length; i++) {
			if (typeof array[i] == "string") array[i] = {use$: array[i]};
		}
	}
	return array;
}
