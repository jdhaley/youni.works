const symbol = {
	class: Symbol("class"),
	extends: Symbol("extends"),
	implements: Symbol("implements"),
	name: Symbol.toStringTag,
	iterator: Symbol.iterator
}
function createType(name, extend) {
	const type = Object.create(extend || null);
	Reflect.defineProperty(type, symbol.name, {value: name});
	Reflect.defineProperty(type, symbol.class, {value: type});
	return type;
}

const Record = Object.freeze(createType("Record"));
const Table = Object.freeze(createType("Table"));
const Interface = Object.freeze(createType("Interface", Table));
const ARRAY = createType("Array");
ARRAY.length = 0;
ARRAY[symbol.iterator] = function *() {
	const length = this.length;
	for (let i = 0; i < length; i++) yield this[i];
};
Object.freeze(ARRAY);

const OBJECT = createType("Object");

export default {
	package$: "youni.works/sys",
	Record: Record,
	Table: Table,
	Interface: Interface,
	Array: ARRAY,
	Object: OBJECT,
	Declaration: {
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
	Compiler: {
		type$: OBJECT,
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
		isSource: function(value) {
			return typeof value == "object" && Object.getPrototypeOf(value) == Object.prototype
		},
		isTypeName: function(name) {
			return name.charAt(0) == name.charAt(0).toUpperCase() && name.charAt(0) != name.charAt(0).toLowerCase();
		},
		compile: function(source, typeName) {
			if (source && typeof source == "object") {
				if (typeName) {
					let decls = this.createInterface(source);
					let type = GET_TYPE;
					value[symbol.name] = name;
					value[symbol.class] = value;
					Object.freeze(value);					
				}
				
				if (source.prototype == Object.prototype) {
					

				}
				if (source.prototype == Array.prototype) {
					let target = Object.create(ARRAY);
					for (let i = 0; i < source.length; i++) {
						target[i] = this.compile(source[i]);
					}
					array.length = source.length;
					return Object.freeze(target);
				}
			}
			return source;
		},
//		parseObject: function(source) {
////			if (typeof value != "string") target[name].type = typeof value;
////			target[name].value = valueOf(value);
//
//		},
		parse: function(source) {
		},
		createInterface: function(source) {
			if (!typeOf(source) == "object") return null;
			let decls = Object.create(Interface);
			for (let property in source) {
				let facet = this.facetOf(property);
				let name = this.nameOf(property);
				if (decls[name]) console.warn(`Duplicate property name "${name}"`);
				if (name) {
					let value = this.parse(source[property]);
					if (Object.getPrototypeOf(value) == Interface && name.charAt(0) == name.charAt(0).toUpperCase()) {
						value[Symbol.toStringTag] = name;
					}
					decls[name] = this.declare(name, value, facet);
				}
			}
			return Object.freeze(decls);
		},
		forName: function(name) {
			let ctx = name.substring(0, name.lastIndexOf("/") + 1);
			let component = this.packages[ctx];
			if (!component) {
				if (path) {
					throw new Error(`Package "${path}" does not exist`);
				} else {
					throw new Error(`Package origin is missing.`);
				}
			}
			let path = name.substring(name.lastIndexOf("/")).split();
			for (let name of path) {
				if (!component[name]) {
					throw new Error(`Component "${name}" not defined in "${ctx}"`);
				}
				component = component[name];
				ctx += "." + name;
			}
			return component;
		}
	},
	System: {
		packages: Object.create(Table),
		facets: Object.create(Table),
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
				object[name] = value;
			}
		},
		implement: function(object, declarations) {
			let c = this.compiler;
			for (let decl in declarations) {
				let name = c.nameOf(decl);
				if (name) {
					let facet = c.facetOf(decl);
					let value = declarations[decl];
					let isType = !facet && c.isTypeName(name) && c.isSource(value);
					value = this.compiler.compile(value, isType ? name : undefined);
					this.define(object, name, value, facet);
				}
			}
		},
		extend: function(object, declarations) {
			object = Object.create(object || null);
			this.implement(object, declarations);
			return object;
		},
		compiler: null
	},
	start: function(conf) {
		this.System.compiler = this.Compiler;
		let sys = createType("System");
		this.Compiler.sys = sys;
		this.System.implement(sys, this.System);
		const Declaration = sys.extend(null, this.Declaration);
		for (let facet in conf.facets) {
			let type = sys.extend(Declaration, conf.facets[facet]);
			sys.facets[facet] = type;
		}
		Object.freeze(sys.facets);
		return sys;
	}
}
/*
	* sys
	* @toStringTag

		defineInterface: function(object, name) {
			if (!object.sys) OBJECT.defineProperty(object, "sys", {value: this});
			if (name) OBJECT.defineProperty(object, Symbol.toStringTag, {value: name});
			if (this.isInterface(this.prototypeOf(object))) {
				OBJECT.defineProperty(object, INTERFACE, {value: object});
			}
		},

 */
const EMPTY_ARRAY = arrayOf([]);


function arrayOf(source) {
	if (!source) return EMPTY_ARRAY;
	let array = Object.create(null);
	for (let i = 0; i < source.length; i++) array[i] = source[i];
	array.length = source.length;
	return Object.freeze(array);
}

function createInterface(name, decls, supers) {
	if (!decls) decls = Object.create(null);
	decls[symbol.extends] = arrayOf(supers);
	decls[symbol.typeName] = name;
}

function typeOf(value) {
	let type = typeof value;
	switch (type) {
		case "undefined":
		case "symbol":
		case "boolean":
		case "number":
		case "string":
		case "function":
			return type;
		case "bigint":
			return "number";
	}
	
	if (value && typeof value == "object") {
		let proto = Object.getPrototypeOf(value);
		if (proto == Object.prototype) return "object";
		if (proto == Array.prototype) return "array";
	}
	return "";
}