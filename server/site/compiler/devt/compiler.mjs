export default {
	package$: "youniworks.com/compiler",
	Log: {
		info: (/* arguments */) => undefined,
		warn: (/* arguments */) => undefined,
		error: (/* arguments */) => undefined
	},
	Compiler: {
		super$: "Object",
		type$log: "Log",
		compile: function(node) {
		}
	},
	Context: {
		super$: "Compiler",
		content: {},
		forName: function(componentName) {
			let component = this.content;
			let path = componentName ? componentName.toString().split(".") : [];
			let pathName = "";
			for (let name of path) {
				if (!component[name]) {
					let msg = pathName
						? `"${pathName}" does not contain "${name}".`
						: `"${name}" does not exist`;
					return this.log.error(msg, component);
				}
				pathName += (pathName ? "." : "") + name;
				component = this.resolve(component, name);
			}
			return component;
		},
		resolve: function(component, name) {
			return component[name];
		}
	},
	Constructor: {
		super$: "Context",
		constructors: {},
		facets: {},
		compile: function(prop) {
			let compiler = this.compilerFor(prop.source);
			let target = compiler.call(this, prop);
			let fn = this.facets[prop.facet || "default"];
			if (!fn) {
				this.log.warn(`Facet "${prop.facet}" is not defined.`);
				fn = this.facets["default"];
			}
			fn && fn.call(this, prop, target);
		},
		resolve: function(component, name) {
			let value = component[name];
			if (this.sys.isDeclaration(value)) {
				this.compile(value);
				Object.defineProperty(component, name, value);
				value = component[name];
			}
			return value;
		},
		compileValue: function(value, context) {
			let compiler = this.compilerFor(value);
			if (compiler == this.constructors.default) return value;
			
			let saveCtx = this.content;
			if (context) this.sys.define(this, "content", context);
			value = compiler.call(this, this.sys.declare(value));
			if (context) this.sys.define(this, "content", saveCtx);
			return value;
		},
		compileFunction: function(value) {
			if (typeof value == "string") value = new Function("", value ? `return ${value};` : "");
			if (typeof value != "function") {
				this.log.warn(`Value is not a function or expression.`);
			}
			return value;
		},
		compilerFor: function(value) {
			let constr = this.constructors.default;
			if (this.sys.prototypeOf(value) == Object.prototype) {
				constr = this.constructors.type;
				for (let decl in value) {
					let name = this.nameOf(decl);
					if (!name) {
						let facet = this.facetOf(decl);
						if (facet) {
							if (this.constructors[facet]) return this.constructors[facet];
							this.log.warn(`Constructor "${facet}" is not defined.`);
						}
						return constr;
					}
				}
			} else if (this.sys.prototypeOf(value) == Array.prototype) {
				constr = this.constructors.array;
			}
			return constr;
		},
		sourceType: function(source) {
			for (let decl in source) {
				let name = this.nameOf(decl);
				if (!name) {
					let type = source[decl];
					if (typeof type == "string") type = this.forName(type);
					return type || null;
				}
			}
			return null;
		},
		loader: function() {
			let compiler = this;
			this.sys.implement(this.sys, {
				load: function(value, context) {
					return compiler.compileValue(value, context);
				},
				implement: function(object, declarations) {
					for (let decl in declarations) {
						let name = compiler.nameOf(decl);
						let facet = compiler.facetOf(decl);
						decl = this.declare(declarations[decl], name, facet);
						if (object && name) try {
							compiler.compile(decl);
							this.define(object, name, decl);
						} catch (error) {
							compiler.log.error(error);
						}
					}
					return object;
				}
			});
			return Object.freeze(this.sys);
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
		},
		//TODO configure
		symbol: {
			"iterator": Symbol.iterator
		}
	}
}