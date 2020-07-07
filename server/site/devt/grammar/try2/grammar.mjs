export default {
	package$: "youniworks.com/grammar",
	package$compiler: "youniworks.com/compiler",
	package$rules: "youniworks.com/grammar-rules",
	Grammar: {
		super$: "compiler.Compiler",
		log: console,
		type$rule: "rules.grammar",
		logView: function logTree(view) {
			let doc = new DOMParser().parseFromString(view.markup, "text/xml");
			this.log.info(doc);
		},
		target: function(source) {
			return this.compile(this.view(source));
		},
		view: function(source) {
			return this.rule.view(source);
		},
		compile: function(view) {
			return view;
		},
	},
	GrammarCompiler: {
		super$: "Grammar",
		targets: {
			sequence: function(expr) {
				let rule = this.declare("Sequence", expr);
				rule.exprs = this.compileExprs(expr);
				return rule;
			},
			choice: function(expr) {
				let rule = this.declare("Choice", expr);
				rule.exprs = this.compileExprs(expr);
				return rule;
			},
			term: function(expr) {
				let rule = this.declare("Term", expr);
				rule.term = expr.text.slice(1, expr.text.length - 1);
				return rule;
			},
			match: function(expr) {
				let rule = this.declare("Match", expr);
				rule.viewName = expr.text;				
				return rule;
			},
			call: function(expr) {
				let rule = this.declare("Rule", expr);
				let text = expr.text;
				if (text.startsWith("~")) {
					rule.not = true;
					text = text.slice(1);
				}
				rule.type$expr = text;
				return rule;
			},
			text: function(expr) {
				let rule = this.declare("Match", expr);
				if (!expr.ruleName) rule.production = "none";
				rule.viewText = expr.text.slice(1, expr.text.length - 1);
				return rule;
			},
			unknown: function(view) {
				let rule = this.declare("Any", view);
				console.warn(`Unknown expression type "${view.name}"`);
				return rule;
			}
		},
		prototype: {
			grammar: "youniworks.com/grammar-rules",
			parser: "youniworks.com/parser",
		},
		compile: function(view) {
			this.logView(view);
			let grammar = {
				package$: this.prototype.grammar,
				package$parser: this.prototype.parser,
			}
			for (let ruleView of view) {
				if (ruleView.name == "rule") {
					let rule = this.compileRule(ruleView);
					if (grammar[rule.name]) this.log.warn(`Rule "${rule.name}" is already declared.  Replacing.`);
					grammar[rule.name] = rule;
				} else {
					this.log.warn(`View "${ruleView.name}" is not a rule. Igorning.`);
				}
			}
			this.log.info(JSON.stringify(grammar));

			//* Compile the package...
			return this.sys.load(grammar);
		},
		compileRule: function(view) {
			let decl = view.at(0).text;
			let expr = view.at(1);
			expr.ruleName = this.nameOf(decl);
			expr.production = this.facetOf(decl);
			let v = view.at(2);
			if (v && v.name == "number") {
				expr.number = v.text;
				if (view.at(3)) expr.next = view.at(3).text;
			}	
			if (v && v.name == "next") expr.next = v.text;
			let target = this.targets[expr.name] || this.targets.unknown;
			return target.call(this, expr);
		},
		declare: function(type, view) {
			let decl = {}; //create a simple object so it can be compiled (loaded) by the system.
			decl.type$ = "parser." + type;
			if (view.ruleName) decl.name = view.ruleName;
			if (view.production) decl.production = view.production;
			switch (view.number) {
				case "*":
					decl.min = 0;
					decl.max = Number.MAX_SAFE_INTEGER;
					break;
				case "!":
					decl.min = 1;
					decl.max = Number.MAX_SAFE_INTEGER;
					break;
				case "?":
					decl.min = 0;
					decl.max = 1;
					break;
			}
			if (view.next) decl.type$next = view.next;
			return decl;
		},
		compileExprs: function(expr) {
			let exprs = [];
			for (let i = 0; i < expr.length; i++) {
				let ele = expr.at(i);
				let num = expr.at(i + 1);
				if (num && num.name == "number") {
					ele.number = num.text;
					i++;
				}
				let target = this.targets[ele.name] || this.targets.unknown;
				ele = target.call(this, ele);
				exprs.push(ele);
			}
			return exprs;
		},
		type$nameOf: "compiler.Constructor.nameOf",
		type$facetOf: "compiler.Constructor.facetOf"
	}
}