export default {
	package$: "youniworks.com/parser",
	package$content: "youniworks.com/content",
	Rule: {
		super$: "content.Controller",
		production: "",
		min: 1,
		max: 1,
		facet: {
			none: function(source, start, view) {
				return this.scan(source, start);
			},
			token: function(source, start, view) {
				let match = this.scan(source, start);
				if (match && view) {
					let node = this.control();
					node.accept(source.slice(start, start + match));
					if (this.next) node = this.next.view(node);
					this.target(node, view);
				}
				return match;
			},
			set: function(source, start, view) {
				let node = view ? this.control() : null;
				let match = this.scan(source, start, node);
				if (match && view && this.name) {
					view[this.name] = node;
				}
				return match;
			},
			lift: function(source, start, view) {
				let node = view ? this.control() : null;
				let match = this.scan(source, start, node);
				if (match && view) {
					if (this.next) node = this.next.view(node);
					this.target(node, view);
				}
				return match;
			},
			default: function(source, start, view) {
				return this.facet.lift.call(this, source, start, view);
			}
		},
		view: function(source) {
			let view = this.control();
			view.source = source;
			//Convert the source to a Text Sequence if needed.
			if (!this.sys.isPrototypeOf(this.type.var, source)) {
				source = this.control("" + source);				
			}
			this.parse(source, 0, view);
			return view;
		},
		scan: function(source, start, view) {
			let at = start;
			for (let count = 0; count < this.max && at < source.length; count++) {
				let match = this.match(source, at, view);
				if (match) {
					at += match;
				} else {
					if (count < this.min) at = start;
					break;
				}
			}
			return at - start;
		},
		match: function(source, start, view) {
			let match = this.expr && this.expr.parse(source, start, view) || 0;
			if (this.not) return match ? 0 : 1;
			return match;
		},
		parse: function(source, start, view) {
			let facet = this.facet[this.production || "default"];
			if (!facet) this.log.error(`Production facet "${this.production}" is not defined.`);
			return facet.call(this, source, start, view);
		},
		target: function(node, view) {
			if (!this.name || this.production == "lift") {
				for (let ele of node) view.accept(ele);
			} else {
				view.accept(node);
			}
		}
	},
	Any: {
		super$: "Rule",
		match: function(source, start, view) {
			return 1;
		}
	},
	Sequence: {
		super$: "Rule",
		exprs: null,
		match: function(source, start, view) {
			let at = start;
			if (this.exprs) for (let expr of this.exprs) {
				let match = expr.parse(source, at, view);
				//NB: expr.min check to enable optional parts in the sequence.
				if (!match && expr.min) return 0;
				at += match;
			}
			return at - start;
		}
	},
	Choice: {
		super$: "Rule",
		exprs: null,
		type$unmatched: "Rule",
		match: function(source, start, view) {
			if (this.exprs) for (let expr of this.exprs) {
				let match = expr.parse(source, start, view);
				//NB: This is a PEG-based choice: Choices are precedence-based.
				if (match) return match;
			}
			//return this.unmatched.parse(source, start, view);
			return 0;
		}
	},
	Match: {
		super$: "Rule",
		viewName: "",
		viewText: "",
		match: function(source, start) {
			source = source.at(start);
			if (source) {
				if (this.viewName && this.viewName != source.name) return 0;
				if (this.viewText && this.viewText != source.text) return 0;
				return 1;
			}
			return 0;
		},
		parse: function(source, start, view) {
			let match = this.match(source, start);
			if (match && view && this.production != "none") {
				let node;
				if (this.production != "lift") {
					node = this.control();
					node.accept(source.at(start));
				} else {
					node = source.at(start);
				}
				this.target(node, view);
			}
			return match;
		}
	},
	Term: {
		super$: "Rule",
		production: "none",
		term: null,
		match: function(source, start, view) {
			return this.term.indexOf(source.at(start)) >= 0 ? 1 : 0;
		}
	},
	strip: {
		type$: "Rule",
		view: function(view) {
			let text = view.text.slice(1, view.text.length - 1);
			view.splice(0);
			view.accept(text);
			return view;
		}
	}
}