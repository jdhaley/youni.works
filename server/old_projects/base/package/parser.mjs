export default {
	package$: "youni.works/compiler/parser",
	use: {
		package$model: "youni.works/compiler/model"
	},
	Parser: {
		super$: "Object",		
		parse: function(content, start, target) {
			if (target) target.append(content.at(start));
			return 1;
		}
	},
	Expr: {
		super$: "Parser",
		type$expr: "Parser",
		min: 1,
		max: 1,
		negate: false,
		parse: function(content, start, target) {
			let at = start;
			for (let count = 0; count < this.max && at < content.length; count++) {
				let match = this.expr.parse(content, at, target);
				if (this.negate) match = match ? 0 : 1;
				if (match) {
					at += match;
				} else {
					if (count < this.min) at = start;
					break;
				}
			}
			return at - start;
		}
	},
//	Choice: {
//		super$: "Expr",
//		type$choice: "use.model.Strand",
//		scan: function(content, start, target) {
//			if (typeof this.choice == "string") {
//				return this.choice.indexOf(content.at(start)) >= 0 ? 1 : 0;
//			}
//			for (let expr of this.choice) {
//				let match = expr.parse(content, start)
//				//NB: This is a PEG-based (precedence) choice so return the first match
//				if (match && target) return expr.parse(content, start, target);
//			}
//			return 0;
//		}
//	},
	Choice: {
		super$: "Parser",
		type$choice: "use.model.Strand",
		parse: function(content, start, target) {
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
		super$: "Parser",
		type$sequence: "use.model.Strand",
		parse: function(content, start, target) {
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
		super$: "Parser",
		name: "",
		rule: "",
		parse: function(content, start, target) {
			let node = content.at(start);
			if (!node || this.name && this.name != node.name) return 0;
			if (!this.rule) return 1;
			if (typeof this.rule == "string") {
				return this.rule === node.text ? 1 : 0				
			}
			return this.rule.parse(node.content, 0) ? 1 : 0;
		}
	},
	Target: {
		super$: "Object",
		type$name: "",
		type$expr: null,
		target: function(target, content, start, match) {
			content = content.slice(start, start + match);		
			if (this.expr) {
				let node = target.owner.create(this.name);
				target.append(node);				
				this.expr.parse(content, 0, node);
			} else {
				let node = target.owner.create(this.name, content);
				target.append(node);								
			}
		}
	},
//	Production: {
//		super$: "Parser",
//		name: "",
//		type$expr: "Parser",
//		type$target: "Target",
//		parse: function(content, start, target) {
//			let match = this.expr.parse(content, start);
//			if (match && target) {
//				this.target.target(target, content, start, match);
//			}
//			return match;
//		}
//	},
//	if (target) {
//		let node = target.owner.create(this.name);
//		target.append(node);
//		target = node;
//	}
	Append: {
		super$: "Parser",
		type$expr: "Parser",
		parse: function(content, start, target) {
			let match = this.expr.parse(content, start);
			if (target) for (let i = start; i < start + match; i++) {
				target.append(content.at(i));
			}
			return match;
		}
	},
	Create: {
		super$: "Parser",
		name: "",
		type$expr: "Parser",
		parse: function(content, start, target) {
			let match = this.expr.parse(content, start);

			if (match && target) {
				if (typeof content == "string") {
					return this.tokenize(target, content, start, match);
				}
				let node = target.owner.create(this.name);
				target.append(node);
				return this.expr.parse(content, start, node);
			}
			
			return match;
		},
		tokenize: function(target, content, start, match) {
			let node = target.owner.create(this.name, content.slice(start, start + match));
			target.append(node);
			return match;
		}
	},
	Pipe: {
		super$: "Parser",
		name: "",
		type$pipeline: "use.model.Strand",
//		parse: function(content, start, target) {
//			let match = this.pipeline[0].parse(content, start);
//			if (target && match) {
//				this.pipe(content.slice(start, start + match), target);
//			}
//			return match;
//		},
//		pipe: function(source, target) {
//			let node;
//			for (let rule of this.pipeline) {
//				node = target.owner.create(this.name);
//				rule.parse(source, 0, node);
//				source = node.content;
//			}
//			target.append(node);
//		}
		parse: function(content, start, target) {
			if (this.pipeline.length < 2) throw new Error("Pipeline requires 2 or more rules.");
			let last = this.pipeline.length - 1; //Don't loop on the last one.
			let rule = this.pipeline[0];
			let pipe = target && target.owner.create();
			let match = rule.parse(content, start, pipe);
			if (match && pipe) {
				for (let i = 1; i < last; i++) {
					rule = this.pipeline[i];
					content = pipe.content;
					pipe.content = [];
					rule.parse(content, 0, pipe);
				}
				rule = this.pipeline[last];
				content = pipe.content;
				rule.parse(content, 0, target);
			}
			return match;
		}
	},
	Process: {
		super$: "Parser",
		type$expr: "Parser",
		parse: function(content, start, target) {
			let node = content.at(start);
			if (node.content) {
				content = node.content;
				node.content = [];
				this.expr.parse(content, 0, node);

			}
			target.append(node);
			return 1;
		}
	},
	Down: {
		super$: "Parser",
		type$expr: "Parser",
		parse: function(content, start, target) {
			let node = content.at(start);
			if (node.content) {
				content = node.content;
				node.content = [];
				this.expr.parse(content, 0, node);

			}
			target.append(node);
			return 1;
		}
	},
	Divvy: {
		super$: "Parser",
		name: "",
		pn: "",
		parse: function(content, start, target) {
			let match = content.length - start;
			if (!target) return match;
			
			let node = target.owner.create(this.name);
			target.append(node);
			target = node;
			
			let slice = [];
			for (let i = start; i < content.length; i++) {
				let node = content.at(i);
				if (node.name == "pn" && node.text == this.pn) {
					slice = createStatement(slice, target);
				} else {
					this.process(content, i, slice);
				}
			}
			if (slice.length) createStatement(slice, target)
			return match;
		},
		process: function(content, start, slice) {
			slice.push(content.at(start));
		}
	}
}

function createStatement(slice, target) {
	let node;
	switch (slice.length) {
		case 0:
			node = target.owner.create("stmt");
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
	return slice;
}