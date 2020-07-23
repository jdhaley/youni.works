export default {
	package$: "youni.works/compiler/parser",
	use: {
		package$model: "youni.works/compiler/model"
	},
	Parser: {
		super$: "Object",		
		parse: function(content, start, target) {
			return 0;
		}
	},
	Option: {
		super$: "Parser",
		type$expr: "Parser"
		min: 1,
		max: 1,
		parse: function(content, start, target) {
			let at = start;
			let match;
			for (let count = 0; count < this.max && at < content.length; count++) {
				match = this.expr.parse(content, at);
				at += match;
				if (!match) {
					return count < this.min ? 0 :  at - start;
				}
			}
			return at - start;
		}
	},
	Choice: {
		super$: "Parser",
		type$choice: "use.model.Strand",
		parse: function(content, start, target) {
			for (let expr of this.choice) {
				let match = this.match(expr, content, start, target);
				//NB: This is a PEG-based (precedence) choice so return the first match
				if (match) return match;
			}
			return 0;
		},
		match: function(expr, content, start, target) {
			if (expr.parse) {
				return expr.parse(content, start, target);
			}
			return expr === content.at(start) ? 1 : 0;
		}
	},
	Sequence: {
		super$: "Expr",
		type$sequence: "use.model.Strand",
		parse: function(content, start, target) {
			let at = start;
			let match;
			for (let expr of this.sequence) {
				match = this.match(expr, content, start, target);
				at += match;
				// The strict zero test is used to ensure expr is in fact a min 0 expression
				// and not an undefined value.
				if (!match && !(expr.min === 0)) return 0;
			}
			return at - start;
		},
		match: function(expr, content, start, target) {
			if (expr.parse) {
				return expr.parse(content, start, target);
			}
			return expr === content.at(start) ? 1 : 0;
		}
	},
	Match: {
		super$: "Expr",
		nodeName: "",
		nodeText: "",
		suppress: false,
		scan: function(content, start, target) {
			let content = content.at(start);
			let match = this.match(content) ? 1 : 0;
			if (target && !this.suppress) {
				if (this.negate ? !match : match) target.append(content);
			}
			return match;
		},
		//Returns boolean.
		match: function(node) {
			if (this.nodeName && this.nodeName != node.name) return false;
			if (this.nodeText && this.nodeText != node.text) return false;
			return true;
		}
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
		parse: function(content, start, target) {
			if (!this.expr) {
				target && target.append(this.createNode());
				return 0;
			}
			let match = this.expr.parse(content, start);
			if (!match || !target) return match;
			if (this.name && typeof content == "string") {
				let node = this.createNode(content.slice(start, start + match));
				target.append(node);
				return match;
			}
			let node = this.createNode();
			target.append(node);
			this.expr.parse(content, start, node);
			return match;
		}
	},
	Pipe: {
		super$: "Parser",
		use: {
			type$Owner: "use.model.Owner"
		},
		type$pipeline: "use.model.Strand",
		type$target: "Parser",
		createNode: function(content) {
			return this.use.Owner.create("pipe", content);
		},
		parse: function(content, start, target) {
			if (this.pipeline.length < 2) throw new Error("Pipeline requires 2 or more rules.");
			let length = this.pipeline.length - 1; //Don't loop on the last one.
			for (let i = 0; i < length; i++) {
				let rule = this.pipeline[i];
				let pipe = this.createNode();
				let match = rule.parse(content, start, pipe);
				console.debug(pipe.markup);
				content = pipe.content;
				start = 0;
			}
			return this.pipeline[length].parse(content, 0, target);
		}
	}
}