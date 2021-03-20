export default {
	package$: "youniworks.com/source/compiler",
	package$content: "youniworks.com/content",
	Source: {
		super$: "Object",
		type$controller: "Compiler",
		type$source: "content.View",
		notices: null,
		type$scope: "Source",
		parts: null,
		get: function(name) {
			for (let scope = this; scope; scope = scope.scope) {
				if (scope.parts) for (let part of scope.parts) {
					if (part.name == name) return part;
				}
			}
		},
		get$depth: function() {
			return this.scope ? this.scope.depth + 1 : 0;
		},
		notice: function() {
			if (!this.notices) this.notices = [];
			arguments.part = this;
			this.notices.push(arguments);
			console.error.apply(console, arguments);
		},
	},
	Compiler: {
		super$: "Object",
		type$controlType: "Source",
		compilers: {
			type$unknown: "Compiler",
		},
		view: function(view, scope) {
			let control = this.control(view, scope);
			this.compile(control);
			return this.target(control);
		},
		control: function(view, scope) {
			return this.sys.extend(this.controlType, {
				const$controller: this,
				const$source: view,
				const$scope: scope || null,
				parts: null,
				notices: null
			});
		},
		controlSource: function(source, scope) {
			let compiler = this.compilers[source.name] || this.compilers.unknown;
			let control = compiler.control(source, scope);
			if (scope) {
				if (!scope.parts) scope.parts = [];
				scope.parts.push(control);				
			}
			return control;
		},
		compile: function(part) {
		},
		target: function(part) {
			return "";
		},
		indent: function(depth) {
			let out = "";
			for (let i = 0; i < depth; i++) out += "\t";
			return out;
		}
	}
}