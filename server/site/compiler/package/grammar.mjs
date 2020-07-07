export default {
	package$: "youni.works/compiler/grammar",
	use: {
		package$parser: "youni.works/compiler/parser"
	},
//	package$rules: "youniworks.com/grammar-rules",
	Grammar: {
		super$: "Object",
		log: console,
		type$rule: "use.parser.Rule", //"rules.grammar",
		logView: function logTree(view) {
			let doc = new DOMParser().parseFromString(view.markup, "text/xml");
			this.log.debug(doc);
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
		prototype: {
			grammar: "youniworks.com/grammar-rules",
			parser: "youniworks.com/parser",
		},
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
				let rule;
				if (expr.text) {
					rule = this.declare("Term", expr);
					rule.term = expr.text;
				} else {
					rule = this.declare("Any", expr);
					rule.production = "token";
				}
				return rule;
			},
			match: function(expr) {
				let rule = this.declare("Match", expr);
				if (expr.at(0).name == "text") {
					if (!expr.ruleName) rule.production = "none";
					rule.viewText = expr.at(0).text;
					rule.viewName = expr.at(1).text;
				} else {
					rule.viewName = expr.at(0).text;				
				}
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
				return {
					type$: expr.text,
					name: expr.ruleName
				}
			},
			unknown: function(view) {
				let rule = this.declare("Any", view);
				console.warn(`Unknown expression type "${view.name}"`);
				return rule;
			}
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
			this.log.debug(JSON.stringify(grammar));

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
		facetOf: function(declaration) {
			if (typeof declaration == "string") {
				return declaration.indexOf("$") >= 0 ? declaration.substr(0, declaration.indexOf("$")) : "";
			}
			return "";
		},
		nameOf: function(declaration) {
			if (typeof declaration == "string") {
				if (declaration.indexOf("$") >= 0) declaration = declaration.substr(declaration.indexOf("$") + 1);
				if (declaration.startsWith("@")) declaration = this.symbol[declaration.slice(1)];
			}
			return declaration;
		}
	}
}