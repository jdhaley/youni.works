const TABLE = Object.freeze(Object.create(null));
const Instance = Object.create(null);

export default {
	table: TABLE,
	Record: {
	},
	Array: {
		length: 0,
		"@iterator": function *() {
			for (let i = 0; i < this.length; i++) yield this[i];
		}
	},
	//The Object.sys property is implicitly defined when the system boots.
	Instance: Instance,
	Interface: {
		type$: Instance,
		properties: TABLE,
		applyTo: function(object) {
			let props = this.properties;
			for (let name in props) props[name].define(object);
		}
	},
	Property: {
		type$: Instance,
		name: "",
		source: undefined,
		compile: undefined,
		declare: function(name, value) {
			return this.sys.extend(this, {
				name: name,
				source: value,
				configurable: true,
				enumerable: true
			});
		},
		define: function(object) {
			if (this.compile) {
				this.compile();
				delete this.compile;
				Object.freeze(this);
			}
			Reflect.defineProperty(object, this.name, this);
		}
	},
	System: {
		type$: Instance,
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
				if (declaration.startsWith("@")) declaration = Symbol[declaration.slice(1)];
			}
			return declaration;
		},
		isSource: function(value) {
			if (value && typeof value == "object") {
				let proto = Object.getPrototypeOf(value);
				if (proto == Object.prototype || proto == Array.prototype) return true;
			}
			return false;
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
			let path = name.substring(name.lastIndexOf("/") + 1);
			if (path) for (let name of path.split()) {
				component = checkComponent(this, component);
				if (!component[name]) {
					console.error(`Component "${name}" not defined in "${ctx}"`);
					return undefined;
				}
				component = component[name];
				ctx += "." + name;
			}
			return checkComponent(this, component);
		}
	}
}

function checkComponent(sys, component) {
	return component;
//	if (component && typeof component == "object" && component[sys.symbol.status] == "uncompiled") {
//		let type = component
//	}
}
//function compileSource(sys, source) {
//	if (typeof source != "object" || !source) return source;
//	let proto = Object.getPrototypeOf(source);
//	if (proto == Array.prototype) {
//		let array = Object.extend(system.Array, {
//			length: value.length
//		});
//		for (let i = 0; i < value.length; i++) {
//			array[i] = compileSource(sys, value[i]);
//		}
//		value = Object.freeze(array);
//	} else if (proto == Object.prototype) {
//		value = loadSource(sys, value);
//	}
//
//	if (type == "object") {
//	}
//}