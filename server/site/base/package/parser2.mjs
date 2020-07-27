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
	Expr: {
		super$: "Parser",
		min: 1,
		max: 1,
		negate: false,
		parse: function(content, start, target) {
			if (start + this.min > content.length) return 0;
			let at = start;
			for (let count = 0; count < this.max; count++) {
				let match = this.scan(content, at, target);
				if (this.negate) match = match ? 0 : 1;
				if (match) {
					at += match;
				} else {
					if (count < this.min) at = start;
					break;
				}
			}
			return at - start;
		},
		scan: function(content, start, target) {
			return 1;
		}
	},
	Choice: {
		super$: "Expr",
		type$choice: "use.model.Strand",
		scan: function(content, start, target) {
			for (let expr of this.choice) {
				let match = expr.parse
					? expr.parse(content, start, target)
					: (expr === content.at(start) ? 1 : 0);
				//NB: This is a PEG-based (precedence) choice so return the first match
				if (match) return match;
			}
			return 0;
		}
	},
	Sequence: {
		super$: "Expr",
		type$sequence: "use.model.Strand",
		scan: function(content, start, target) {
			let at = start;
			for (let expr of this.sequence) {
				let match = expr.parse
					? expr.parse(content, at, target)
					: (expr === content.at(at) ? 1 : 0);
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
		rule: "",
		suppress: false,
		scan: function(content, start, target) {
			content = content.at(start);
			let match = this.match(content) ? 1 : 0;
			if (target && !this.suppress) {
				if (this.negate ? !match : match) target.append(content);
			}
			return match;
		},
		//Returns boolean.
		match: function(node) {
			if (this.nodeName && this.nodeName != node.name) return false;
			if (this.rule && this.rule != node.text) return false;
			return true;
		}
	},
	ParseMatch: {
		super$: "Expr",
		nodeName: "",
		type$expr: "Parser",
		scan: function(content, start, target) {
			let node = content.at(start);
			if (this.nodeName && this.nodeName != node.name) return 0;
			this.expr.parse(node.content, 0, target);
			return 1;
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
			if (typeof content == "string") {
				return this.tokenize(content, start, target);
			}

			let node = target ? this.createNode() : null;
			let match = this.expr.parse(content, start, node);
			if (match) {
				target.append(node);
			}
			return match;
		},
		tokenize: function(content, start, target) {
			let match = this.expr.parse(content, start);
			if (match && target) {
				let node = this.createNode(content.slice(start, start + match));
				target.append(node);				
			}
			return match;
		}
	},
	Pipe: {
		super$: "Parser",
		type$pipeline: "use.model.Strand",
		parse: function(content, start, target) {
			let match = this.pipeline[0].parse(content, start);
			if (!match) return match;
			content = content.slice(start, start + match);
			let node = target && target.owner.create(this.name);
			target.append(node);
			for (let i = 1; i < this.pipeline.length; i++) {
				let rule = this.pipeline[i];
				rule.parse(content, 0, node);
				content = node.content;
				node.content = [];
			}
			return match;
		}
	},
	Pipe2: {
		super$: "Parser",
		name: "",
		type$pipeline: "use.model.Strand",
		parse: function(content, start, target) {
			if (this.pipeline.length < 2) throw new Error("Pipeline requires 2 or more rules.");
			let length = this.pipeline.length - 1; //Don't loop on the last one.
			let match = 0;
			for (let i = 0; i < length; i++) {
				let rule = this.pipeline[i];
				match = rule.parse(content, start);
				if (match) {
					content = content.slice(start, start + match);
					start = 0;
				}
				let pipe = target && target.owner.create();
			//	console.debug(pipe.markup);
				content = pipe.content;
				start = 0;
			}
			return this.pipeline[length].parse(content, 0, target);
		}
	},
	/*
 			let match = this.expr.parse(content, start);
			if (match && target) {
				let content = content.slice(start, start + match);
				if (this.name) {
					let node = this.createNode(this.next);
					target.append(node);
					target = node;
				}
				
			}
			return match;
	*/
}