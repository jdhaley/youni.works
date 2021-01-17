let FROM = Symbol("from");

export default {
	Compiler: {
		constructors: {
			"default": function(proto, name, source) {
				return Object.create(proto);
			}
		},
		facets: {
			"default": function(object, name, value) {
				return Reflect.defineProperty(object, name, {
					configurable: true,
					enumerable: typeof value == "function" ? false : true,
					writable: typeof value == "function" ? false : true,
					value: value
				});
			}
		},
		resolve: function(value) {
			switch (typeof value) {
				case "string":
					return null;  //this.resolver.resolve(value);
				case "object":
					return value;
			}
			console.error(`Error: "${value}" is non-resolvable.`);
			return null;
		},
		create: function(source, name) {
			let proto = null;
			let facet = "default";
			for (let prop in source) {
				if (!this.nameOf(prop)) {
					facet = this.facetOf(prop);
					proto = source[prop];
				}
			}
			proto = this.resolve(proto);
			let constr = this.constructors[facet];
			if (!constr) {
				//error
				constr = this.constructors["default"];
			}
			return constr(proto, name, source);
		},
		extend: function(object, source) {
			for (let prop in source) {
				let name = this.nameOf(prop);
				let facet = this.facetOf(prop);
				this.define(object, name, source[prop], facet);
			}			
		},
		define: function(object, name, value, facetName) {
			let facet = this.facets[facetName || "default"];
			if (!facet) {
				//error
				facet = this.facets["default"];
			}
			facet(object, name, value);
		},
		isSource: function(value) {
			return value && typeof value == "object" && Object.getPrototypeOf(value) == Object.prototype;
		},
		compile: function(source, name) {
			source.target = this.create(source, name);
			for (let name in source) {
				let value = source[name];
				if (this.isSource(value)) {
					value[FROM] = source;
					this.compile(value, name);
				}
			}
			this.extend(source.target, source);
			return source.target;
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