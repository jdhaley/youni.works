const OBJECT = Object.create(null);
const TABLE = Object.create(null);

export default {
	Table: TABLE,
	Record: {
	},
	Array: {
		length: 0,
		[Symbol.iterator]: function *() {
			for (let i = 0; i < this.length; i++) yield this[i];
		}
	},
	//The Object.sys property is implicitly defined when the system boots.
	Object: OBJECT,
	Interface: {
		type$: OBJECT,
		properties: TABLE
	},
	Property: {
		type$: OBJECT,
		facet: "",
		name: "",
		configurable: true,
		enumerable: true,
		declare: function(name, value) {
			return this.sys.extend(this, {
				name: name,
				source: value,
				configurable: true,
				enumerable: true,
				writable: true,
				value: value
			});
		},
		define: function(object) {
			Reflect.defineProperty(object, this.name, this);
		}
	},
	System: {
		type$: OBJECT,
		packages: TABLE,
		facets: TABLE,
		symbols: TABLE,
		declare: function(name, source, facet) {
			let type = this.facets[facet];
			if (!type) {
				throw new Error(facet ? `Facet ${facet} does not exist.` : `Missing Facet.`);
			}
			return type.declare(name, source);
		},
		define: function(object, name, value, facet) {
			if (facet) {
				this.declare(name, value, facet).define(object);
				return;
			}
			if (typeof value == "function") {
				Reflect.defineProperty(object, name, {configurable: true, value: value});
			} else {
				Reflect.defineProperty(object, name, {configurable: true, enumerable: true, writable: true, value: value});				
			}
		},
		extend: function(object, declarations) {
			if (typeof object == "string") object = this.forName(object);
			object = Object.create(object || null);
			this.implement(object, declarations);
			return object;
		},
		implement: function(object, declarations) {
			for (let decl in declarations) {
				let facet = this.facetOf(decl);
				let name = this.nameOf(decl);	
				let value = declarations[decl];
				if (name) {
					this.define(object, name, value, facet);
				} else {
					console.warn("Object declaration ignored in System.implement()");
				}
			}
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
		forName: function(name) {
			let ctx = name.substring(0, name.lastIndexOf("/"));
			let component = this.packages[ctx];
			if (!component) {
				if (ctx) {
					throw new Error(`Package "${ctx}" does not exist`);
				} else {
					throw new Error(`Package origin is missing.`);
				}
			}
			let path = name.substring(name.lastIndexOf("/") + 1).split();
			for (let name of path) {
				if (!component[name]) {
					throw new Error(`Component "${name}" not defined in "${ctx}"`);
				}
				component = component[name];
				ctx += "." + name;
			}
			return component;
		}
	}
}