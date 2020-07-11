export default {
	package$: "youni.works/compiler/parser",
	use: {
		package$model: "youni.works/compiler/model"
	},
	Parser: {
		super$: "Object",		
		parse: function(source, start, target) {
		}
	},
	Expr: {
		super$: "Parser",
		min: 0,
		max: 9007199254740991,
		negate: false,
		parse: function(source, start, target) {
			let at = start;
			for (let count = 0; count < this.max && at < source.content.length; count++) {
				let match = this.match(source, at, target);
				if (this.negate) match = match ? 0 : 1;
				if (match) {
					at += match;
					//If there is no target, do a quick match...
					//if (!target && count >= this.min) return true;
				} else {
					if (count < this.min) at = start;
					break;
				}
			}
			return at - start;
		},
		match: function(source, start, target) {
			return 1;
		}
	},
	Sequence: {
		super$: "Expr",
		type$exprs: "use.model.Content",
		match: function(source, start, target) {
			let at = start;
			if (this.exprs) for (let expr of this.exprs) {
				let isTerminal = !expr.parse;
				let match = isTerminal
					? (expr === source.content[at] ? 1 : 0)
					: expr.parse(source, at, target);
				//NB: expr.min check to enable optional parts in the sequence.
				if (!match && (isTerminal || expr.min)) return 0;
				at += match;
			}
			return at - start;
		}
	},
	Choice: {
		super$: "Expr",
		type$exprs: "use.model.Content",
		match: function(source, start, target) {
			//if (typeof this.exprs == "string") return this.exprs.indexOf(source.content[start]) >= 0 ? 1 : 0;
			if (this.exprs) for (let expr of this.exprs) {
				let isTerminal = !expr.parse;
				let match = isTerminal
					? (expr === source.content[start] ? 1 : 0)
					: expr.parse(source, start, target);
				//NB: This is a PEG-based choice: Choices are precedence-based.
				if (match) return match;
			}
			return 0;
		}
	},
	Match: {
		super$: "Expr",
		nodeName: "",
		nodeValue: "",
		match: function(source, start, target) {
			source = source[start];
			if (!source) return 0;
			if (this.nodeName && this.nodeName != source.name) return 0;
			if (this.nodeText && this.nodeText != source.text) return 0;
			return 0;
		}
	},
	Rule: {
		super$: "Parser",
		type$expr: "Expr",
		parse: function(source, start, target) {
			return this.expr.parse(source, start, target);
		}
	},
	Production: {
		super$: "Rule",
		use: {
			type$model: "use.model"
		},
		name: "",
		createNode: function(content) {
			if (!content) content = this.sys.extend(this.use.model.Content, {
				length: 0
			});
			return this.sys.extend(this.use.model.Node, {
				name: this.name || "",
				content: content
			});
		},
		parse: function(source, start, target) {
			let match = this.expr.parse(source, start);
			if (!match || !target) return match;
			if (this.name && typeof source.content == "string") {
				let node = this.createNode(source.content.slice(start, start + match));
				target.accept(node);
				return match;
			}
			let node = this.createNode();
			target.accept(node);
			return this.expr.parse(source, start, node);
		}
	}
}
