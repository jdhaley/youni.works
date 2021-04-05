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
				console.error(`Facet "${facet}" does not exist.`);
				type = this.facets.const;
			}
			return type.declare(name, source);
		},
		define: function(object, name, value, facet) {
			if (facet) {
				this.declare(name, value, facet).define(object);
			} else {
				try {
					object[name] = value;
				} catch (e) {
					Reflect.defineProperty(object, name, {value: value});
				}
			}
		},
		extend: function(object, declarations) {
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
		}
	}
}