const System = {
	Record: Object.create(null),
	Table: Object.create(null),
	Array: Object.create(null),
	Object: Object.create(null),
	Property: Object.create(System.Object),
	Interface: Object.create(System.Object),
	System: Object.create(System.Object)
}

function start(conf) {
	let sys = API.System;
	//define the System classes:
	sys.implement(System.System, API.System);
	sys.implement(System.Property, API.Property);
	sys.implement(System.Interface, API.Interface);
	
	//create the System instance:
	sys = sys.extend(sys, {
		symbols: extend.extend(System.Table, conf.symbols)
		facets: sys.extend(System.Table),
		packages: sys.extend(System.Table),
	});
	//all Objects reference the sys instance:
	System.Object.sys = sys;
	
	//initialize the facets
	for (let facet in conf.facets) {
		let type = sys.extend(System.Property, conf.facets[facet]);
		sys.facets[facet] = type;
	}
	
}

const COMPILER =  {
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
//	parseObject: function(source) {
////		if (typeof value != "string") target[name].type = typeof value;
////		target[name].value = valueOf(value);
//
//	},
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
}
//
//export default {
//	package$: "youni.works/sys",
//	Record: Record,
//	Table: Table,
//	Interface: Interface,
//	Array: ARRAY,
//	Object: OBJECT,
//		type$: OBJECT,
//		isSource: function(value) {
//			if (value && typeof value == "object") {
//				let proto = Object.getPrototypeOf(value);
//				return proto == Object.prototype || proto == Array.prototype ? true : false;
//			}
//			return false;
//		},
//		isTypeName: function(name) {
//			return name.charAt(0) == name.charAt(0).toUpperCase() && name.charAt(0) != name.charAt(0).toLowerCase();
//		},
//		compile: function(value, decl) {
//			return this.isSource(value) ? this.compileSource(value, decl) : value;
//		},
//		forValue: function(value) {
//		},
//		compileSource: function(source, decl) {
//			if (Object.getPrototypeOf(source) == Array.prototype) {
//				let target = Object.create(ARRAY);
//				for (let i = 0; i < source.length; i++) {
//					target[i] = this.compile(source[i]);
//				}
//				target.length = source.length;
//				return Object.freeze(target);
//			}
//			let target = source.type$ || null;
//			if (typeof target != "object") target = this.forName(target) || null;
//			target = this.sys.extend(target, source);
//			
//			let name = this.nameOf(decl || "");
//			if (isTypeName(name)) {
//				target[symbol.name] = name;
//				Object.freeze(target);					
//			}
//			return target;
//		},
//		forName: function(name) {
//			let ctx = name.substring(0, name.lastIndexOf("/") + 1);
//			let component = this.packages[ctx];
//			if (!component) {
//				if (path) {
//					throw new Error(`Package "${path}" does not exist`);
//				} else {
//					throw new Error(`Package origin is missing.`);
//				}
//			}
//			let path = name.substring(name.lastIndexOf("/")).split();
//			for (let name of path) {
//				if (!component[name]) {
//					throw new Error(`Component "${name}" not defined in "${ctx}"`);
//				}
//				component = component[name];
//				ctx += "." + name;
//			}
//			return component;
//		},
//		implement: function(object, decls) {
//			const isRoot = !this.packages[""];
//			if (isRoot) this.packages[""] = decls;
//			let c = this.compiler;
//			for (let decl in decls) {
//				let facet = c.facetOf(decl);
//				let name = c.nameOf(decl);
//				let value = this.compiler.compile(decls[decl], decl);
//				this.define(object, name, value, facet);
//			}
//			if (isRoot) delete this.packages[""]
//		}
//	},
//	start: function(conf) {
//		this.System.implement(OBJECT.sys, this.System);
//		
//		const Property = createType("Property", OBJECT);
//		OBJECT.sys.implement(Property, thi)
//			sys.extend(null, this.Property);
//		for (let facet in conf.facets) {
//			let type = sys.extend(Property, conf.facets[facet]);
//			sys.facets[facet] = type;
//		}
//		Object.freeze(sys.facets);
//		return sys;
//	}
//}
///*
//		createInterface: function(source) {
//			if (!typeOf(source) == "object") return null;
//			let decls = Object.create(Interface);
//			for (let property in source) {
//				let facet = this.facetOf(property);
//				let name = this.nameOf(property);
//				if (decls[name]) console.warn(`Duplicate property name "${name}"`);
//				if (name) {
//					let value = this.parse(source[property]);
//					if (Object.getPrototypeOf(value) == Interface && name.charAt(0) == name.charAt(0).toUpperCase()) {
//						value[Symbol.toStringTag] = name;
//					}
//					decls[name] = this.declare(name, value, facet);
//				}
//			}
//			return Object.freeze(decls);
//		},
//
// */
///*
//	* sys
//	* @toStringTag
//
//		defineInterface: function(object, name) {
//			if (!object.sys) OBJECT.defineProperty(object, "sys", {value: this});
//			if (name) OBJECT.defineProperty(object, Symbol.toStringTag, {value: name});
//			if (this.isInterface(this.prototypeOf(object))) {
//				OBJECT.defineProperty(object, INTERFACE, {value: object});
//			}
//		},
//
// */
//const EMPTY_ARRAY = arrayOf([]);
//
//
//function arrayOf(source) {
//	if (!source) return EMPTY_ARRAY;
//	let array = Object.create(null);
//	for (let i = 0; i < source.length; i++) array[i] = source[i];
//	array.length = source.length;
//	return Object.freeze(array);
//}
//
//function createInterface(name, decls, supers) {
//	if (!decls) decls = Object.create(null);
//	decls[symbol.extends] = arrayOf(supers);
//	decls[symbol.typeName] = name;
//}
//
//function typeOf(value) {
//	let type = typeof value;
//	switch (type) {
//		case "undefined":
//		case "symbol":
//		case "boolean":
//		case "number":
//		case "string":
//		case "function":
//			return type;
//		case "bigint":
//			return "number";
//	}
//	
//	if (value && typeof value == "object") {
//		let proto = Object.getPrototypeOf(value);
//		if (proto == Object.prototype) return "object";
//		if (proto == Array.prototype) return "array";
//	}
//	return "";
//}
//
//function createType(name, extend) {
//	const type = Object.create(extend || null);
//	Reflect.defineProperty(type, symbol.name, {value: name});
//	Reflect.defineProperty(type, symbol.class, {value: type});
//	return type;
//}
////Interface: createType("Interface", pkg.Table),
//
//
//const Record = Object.freeze(createType("Record"));
//const Table = Object.freeze(createType("Table"));
//const Interface = Object.freeze(createType("Interface", Table));
//const ARRAY = createType("Array");
//ARRAY.length = 0;
//ARRAY[symbol.iterator] = function *() {
//	const length = this.length;
//	for (let i = 0; i < length; i++) yield this[i];
//};
//Object.freeze(ARRAY);
//
//const OBJECT = createType("Object");
//OBJECT.sys = createType("System", OBJECT);
//
