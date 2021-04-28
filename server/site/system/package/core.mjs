export default {
	Object: {
		type$: "",
		symbol$sys: null //sys is defined through bootstrapping.
	},
	Parcel: {
		type$: "Object"
	},
	Record: {
		type$: "Object"
	},
	Array: {
		type$: "Object",
		length: 0,
		symbol$iterator: function *() {
			for (let i = 0; i < this.length; i++) yield this[i];
		}
	},
	Instance: {
		type$: "Object",
		get$sys: function() {
			return this[Symbol.sys]; //Symbol.sys is defined through bootstrapping.
		},
		toString: function() {
			//TODO test using Symbol.toPrimitive instead.
			return "";
		}
	},
	Property: {
		type$: "Instance",
		facet: "",
		name: "",
		expr: undefined,
		configurable: true,
		/*
		 * ECMAScript descriptor properties are added through the facet.
		 * define() will fail if the facet isn't first called.
		 */
		define: function(object) {
			Reflect.defineProperty(object, this.name, this);
		}
	},
	System: {
		type$: "Instance",
		use: {
			type$Property: "Property"
		},
		facets: {
		},
		symbols: {
		},
		extend: function(object, decls) {
			if (typeof object == "string") object = this.forName(object);
			object = Object.create(object || null);
			this.implement(object, decls);
			return object;
		},
		implement: function(object, decls) {
			if (decls && typeof decls == "object") for (let decl of Object.getOwnPropertyNames(decls)) {
				let facet = this.facetOf(decl);
				let name = this.nameOf(decl);
				let value = decls[decl];
				if (value && typeof value == "object" && Object.getPrototypeOf(value) == Object.prototype) {
					console.warn("Source object specified in implement():", value);
				}
				if (name) {
					this.define(object, name, value, facet);
				} else if (!object[Symbol.status]) {
					console.warn("Object declaration ignored in Engine.implement()");
				}
			}
			if (decls && typeof decls == "object") for (let symbol of Object.getOwnPropertySymbols(decls)) {
				this.define(object, symbol, decls[symbol]);				
			}
			
		},
		define: function(object, name, value, facetName) {
			let decl;
			if (facetName) {
				let facet = this.facets[facetName];
				if (!facet) {
					throw new Error(`Facet "${facetName}" does not exist.`);
				}
				decl = this.declare(facet, name, value);
				facet(decl);
				decl.define(object);
			} else {
				Reflect.defineProperty(object, name, {
					configurable: true,
					enumerable: true,
					writable: true,
					value: value
				});
			}
		},
		declare: function(facet, name, value) {
			return this.extend(this.use.Property, {
				facet: facet,
				name: name,
				expr: value
			});
		},
		forName: function(name, component) {
			throw new Error("Unimplemented");
		},
		compile: function(value, contextName) {
			throw new Error("Unimplemented");
		},
		facetOf: function(decl) {
			if (typeof decl == "symbol") return "";
			decl = "" + decl;
			let index = decl.indexOf("$");
			return index < 0 ? "" : decl.substr(0, index);
		},
		nameOf: function(decl) {
			if (typeof decl == "symbol") return decl;
			decl = "" + decl;
			let index = decl.indexOf("$");
			return index < 0 ? decl : decl.substring(index + 1);
		}
	}
}