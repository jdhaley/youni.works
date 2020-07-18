export default {
	package$: "youni.works/compiler/parser",
	use: {
		package$model: "youni.works/compiler/model"
	},
	Parser: {
		super$: "Object",		
		parse: function(source, start, target) {
			return 0;
		}
	},
	Expr: {
		super$: "Parser",
		min: 0,
		max: 9007199254740991,
		negate: false,
		parse: function(source, start, target) {
			return this.scan(source, start, target);
		},		
		scan: function(source, start, target) {
			let at = start;
			for (let count = 0; count < this.max && at < source.content.length; count++) {
				let match = this.match(source, at, target);
				if (this.negate) match = match ? 0 : 1;
				if (match) {
					at += match;
					//If there is no target, do a quick predicate match...
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
	Choice: {
		super$: "Expr",
		type$choice: "use.model.Strand",
		match: function(source, start, target) {
			for (let expr of this.choice) {
				let match = expr.parse
					? expr.parse(source, start, target)
					: (expr === source.content.at(start) ? 1 : 0);
				//NB: This is a PEG-based (precedence) choice so return the first match
				if (match) return match;
			}
			return 0;
		}
	},
	Sequence: {
		super$: "Expr",
		type$sequence: "use.model.Strand",
		match: function(source, start, target) {
			let at = start;
			for (let expr of this.sequence) {
				let match = expr.parse
					? expr.parse(source, at, target)
					: (expr === source.content.at(at) ? 1 : 0);
				// The strict zero test is used to ensure expr is in fact a min 0 expression
				// and not an undefined value.
				if (!match && !(expr.min === 0)) return 0;
				at += match;
			}
			return at - start;
		}
	},
	Match: {
		super$: "Expr",
		nodeName: "",
		nodeText: "",
		suppress: false,
		parse: function(source, start, target) {
			let match = this.scan(source, start);
			if (match && target && !this.suppress) {
				for (let i = 0; i < match; i++) {
					target.append(source.content.at(start + i));
				}
			}
			return match;
		},
		match: function(source, start, target) {
			let node = source.content.at(start);
			if (!node) return 0;
			if (this.nodeName && this.nodeName != node.name) return 0;
			if (this.nodeText && this.nodeText != node.text) return 0;
			return 1;
		},
	},
	Production: {
		super$: "Parser",
		use: {
			type$Owner: "use.model.Owner"
		},
		name: "",
		type$expr: "Parser",
		createNode: function(content) {
			return this.use.Owner.create(this.name, content);
		},
		parse: function(source, start, target) {
			let match = this.expr.parse(source, start);
			if (!match || !target) return match;
			if (this.name && typeof source.content == "string") {
				let node = this.createNode(source.content.slice(start, start + match));
				target.append(node);
				return match;
			}
			let node = this.createNode();
			target.append(node);
			return this.expr.parse(source, start, node);
		}
	},
	Pipe: {
		super$: "Parser",
		use: {
			type$Owner: "use.model.Owner"
		},
		type$source: "Parser",
		type$target: "Parser",
		createNode: function(content) {
			return this.use.Owner.create("pipe", content);
		},
		parse: function(source, start, target) {
			let pipe = this.createNode();
			let match = this.source.parse(source, start, pipe);
			return match ? this.target.parse(pipe, 0, target) : 0;
		}
	}
}