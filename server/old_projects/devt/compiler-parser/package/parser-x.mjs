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
		min: 0,
		max: 9007199254740991,
		negate: false,
		isProduction: false,
		parse: function(content, start, target) {
			let at = start;
			for (let count = 0; count < this.max && at < content.length; count++) {
				let match = this.match(content, at, target);
				if (this.negate) match = match ? 0 : 1;
				if (!match && count < this.min) return 0;
				at += match;
			}
			return at - start;
		},
		match: function(content, start, target) {
			return 1;
		}
	},
	Choice: {
		super$: "Expr",
		type$choice: "use.model.Strand",
		once$isProduction: function() {
			for (let expr in this.choice) {
				if (expr.isProduction) return true;
			}
			return false;
		},
		match: function(content, start, target) {
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
		once$isProduction: function() {
			for (let expr in this.sequence) {
				if (expr.isProduction) return true;
			}
			return false;
		},
		match: function(content, start, target) {
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
		nodeText: "",
		match: function(content, start, target) {
			content = content.at(start);
			let match = this.matchNode(content);
			if (target && this.isProduction) {
				if (this.negate ? !match : match) target.append(content);
			}
			return match;
		},
		//Returns boolean.
		matchNode: function(node) {
			if (this.nodeName && this.nodeName != node.name) return 0;
			if (this.nodeText && this.nodeText != node.text) return 0;
			return 1;
		}
	},
	Production: {
		super$: "Parser",
		use: {
			type$Owner: "use.model.Owner"
		},
		isProduction: true,
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