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
	statements: function(pn) {
		return {
			type$: "parser.Parser",
			pn: pn,
			parse: parseStatements
		}
	},
	pipe: function(...pipeline) {
		return {
			type$: "parser.Pipe",
			pipeline: setRef(pipeline)
		}		
	},
	create: function(name, expr) {
		return {
			type$: "parser.Production",
			name: name || "",
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
	match: function(name, rule, expr) {
		return _expr({
//			type$: rule && rule.parse ? "parser.ParseMatch" : "parser.Match",
			type$: "parser.Match",
			nodeName: name || "",
//			expr: rule || "",
			nodeText: rule || "",
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

function parseStatements(content, start, target) {
	let slice = [];
	for (let i = start; i < content.length; i++) {
		let node = content.at(i);
		if (node.name == "pn" && node.text == this.pn) {
			createStatement(slice, target);
		} else {
			slice.push(node);
		}
	}
	if (slice.length) createStatement(slice, target)
	return content.length - start;
}

function createStatement(slice, target) {
	switch (slice.length) {
		case 0:
			node = target.owner.create("void");
			break;
		case 1:
			node = slice[0];
			slice.length = 0;
			break;
		default:
			node = target.owner.create("stmt", slice);
			slice = [];
			break;
	}
	target.append(node);
}