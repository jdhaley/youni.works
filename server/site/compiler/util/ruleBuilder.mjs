export default {
	sequence: function(...seq) {
		return {
			type$: "parser.Sequence",
			sequence: seq,
			min: 1,
			max: 1
		}
	},
	choice: function(...choice) {
		return {
			type$: "parser.Choice",
			choice: choice,
			min: 1,
			max: 1
		}
	},
	match: function(name, text) {
		return {
			type$: "parser.Match",
			nodeName: name,
			nodeText: text || "",
			min: 1,
			max: 1
		}
		
	},
	create: function(name, expr) {
		return {
			type$: "parser.Production",
			name: name,
			expr: expr
		}		
	},
	remove: function(match) {
		match.suppress = true;
		return match;
	},
	opt: function(expr) {
		expr.min = 0;
		expr.max = 1;
		return expr;
	},
	many: function(expr) {
		expr.min = 0;
		expr.max = 9007199254740991;
		return expr;
	},
	negate: function(expr) {
		expr.negate = true;
		return expr;
	},
	charset: function(string) {
		return {
			type$: "parser.Choice",
			choice: "" + string,
			min: 1,
			max: 1
		}		
	},
	charseq: function(string) {
		return {
			type$: "parser.Sequence",
			sequence: "" + string,
			min: 1,
			max: 1
		}		
	}
}