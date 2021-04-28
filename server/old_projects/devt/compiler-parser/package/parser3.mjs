export default {
	package$: "youni.works/compiler/parser",
	use: {
		package$model: "youni.works/base/model",
		package$transform: "youni.works/base/transform"
	},
	Expr: {
		super$: "use.transform.Parser",
		min: 0,
		max: 9007199254740991,
		negate: false,
		parse: function(content, start, target) {
			let at = start;
			for (let count = 0; count < this.max && at < content.length; count++) {
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
				//First scan without the target (do the predicate check)
				let match = expr.parse
					? expr.parse(content, start)
					: (expr === content.at(start) ? 1 : 0);
				//NB: This is a PEG-based (precedence) choice so return the first match
				if (match) {
					//If there is a target passed, then pass it to the matched choice:
					return target && expr.parse ? expr.parse(content, start, target) : match;
				}
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
		nodeText: "",
		scan: function(content, start, target) {
			let node = content.at(start);
			if (this.nodeName && this.nodeName != node.name) return 0;
			if (this.nodeText && this.nodeText != node.text) return 0;
			return 1;
		}
	},
	Pipe: {
		super$: "use.transform.Parser",
		use: {
			type$Owner: "use.model.Owner"
		},
		type$pipeline: "use.model.Strand",
		type$target: "use.transform.Parser",
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