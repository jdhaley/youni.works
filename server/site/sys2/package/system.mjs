const TABLE = Object.freeze(Object.create(null));
const Instance = Object.create(null);
Instance.super = function(name, ...args) {
	const thisValue = this[name];
	for (let proto = Object.getPrototypeOf(this); proto; proto = Object.getPrototypeOf(proto)) {
		let protoValue = proto[name];
		if (protoValue !== thisValue) {
			if (typeof protoValue == "function") return protoValue.apply(this, args);
			break;
		}
	}
	throw new Error(`super "${name}" is not a method.`);
}
//option 2:
Function.prototype.super = function(thisArg, ...args) {
	for (let proto = Object.getPrototypeOf(thisArg); proto; proto = Object.getPrototypeOf(proto)) {
		let protoValue = proto[this.name];
		if (protoValue !== this) {
			if (typeof protoValue == "function") return protoValue.apply(thisArg, args);
			break;
		}
	}
	throw new Error(`super "${this.name}" is not a method.`);
}
//option 3: a method$ facet puts super on the function.

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
	//The Instance.sys property is implicitly defined when the system boots.
	Instance: Instance,
	Interface: {
		type$: Instance,
		properties: TABLE,
		applyTo: function(object) {
			let props = this.properties;
			for (let name in props) props[name].define(object);
		}
	},
	Declaration: {
		//type$: Instance,
		//definedIn: null,
		name: "",
		facet: "",
		expr: undefined
	},
	Property: {
		type$: Instance,
		name: "",
		source: undefined,
		declare: function(name, value) {
			return this.sys.extend(this, {
				name: name,
				source: value,
				configurable: true,
				enumerable: true
			});
		},
		compile: null,
		define: function(object, contextName) {
			try {
				if (this.compile) {
					this.compile(contextName);
					this.sys.define(this, "compile", undefined);
					Object.freeze(this);
				}
				Reflect.defineProperty(object, this.name, this);
			} catch (error) {
				contextName = contextName ? contextName + "/" + this.name : this.name;
				error.message = `When defining "${contextName}": ${error.message}`;
				throw error;
			}
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
			if (object === undefined) object = TABLE;
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
		forName: function(name, component) {
			if (arguments.length < 2) {
				component = this.packages;
			}
			let context = "";
			let path = name.split("/");
			for (let prop of path) {
				if (typeof component != "object") {
					console.error(`For name "${name}": "${context}" is not an object.`);
					return undefined;
				}
				if (!Reflect.getOwnPropertyDescriptor(component, prop)) {
					console.error(`For name "${name}": "${context}" does not define "${prop}".`);
					return undefined;
				}
				if (this.statusOf(component[prop])) {
					this.compiler.compileProperty(component, prop, context);
				}
				component = component[prop];
				context += prop + "/";
			}
			return component;
		},
		statusOf: function(value) {
			if (value && typeof value == "object") return value[this.symbols.compile];
		},
		compile: function(value, contextName) {
			if (this.packages["."]) {
				throw new Error("Compilation in progress.");
			}
			value = this.loader.loadValue(value);
			if (this.statusOf(value)) {
				if (value[""]) {
					value = this.compiler.construct(value, contextName);
				}
				this.packages["."] = value;
				this.compiler.compileProperties(value, contextName)
				delete this.packages["."];
			}
			return value;
		},
		compiler: {
			construct: function(object, contextName) {
				throw new Error("Unimplemented");
			},
			compileProperties: function(object, contextName) {
				throw new Error("Unimplemented");
			},
			compileProperty: function(object, propertyName, contextName) {
				throw new Error("Unimplemented");		
			}
		},
		loader: {
			load: function(source, contextName) {
				throw new Error("Unimplemented");				
			}
		}
	},
	Loader: {
		type$: Instance,
		loadValue: function(value) {
			if (this.sys.statusOf(value)) throw new Error("Possible recursion.");

			if (value && typeof value == "object") {
				let proto = Object.getPrototypeOf(value);
				if (proto == Array.prototype) {
					value = this.loadArray(value);
				} else if (proto == Object.prototype) {
					value = this.loadObject(value);
				}
			}
			return value;
		},
		loadArray: function(source) {
			const sys = this.sys;
			let system = sys.forName("system.youni.works");
			let length = source.length;
			let array = sys.extend(system.Array, {
				length: length
			});
			array[sys.symbols.compile] = "array";
			for (let i = 0; i < length; i++) {
				array[i] = this.loadValue(source[i]);
			}
			return array;
		},
		loadObject: function(source) {
			const sys = this.sys;
			let object = sys.extend(null);
			object[sys.symbols.compile] = "object";
			for (let decl in source) {
				let name = sys.nameOf(decl);
				let facet = sys.facetOf(decl);
				let value = this.loadValue(source[decl]);
				if (facet) {
					value = sys.extend(null, {
						facet: facet,
						name: name,
						expr: value
					});
					value[sys.symbols.compile] = "property";
				}
				object[name] = value;
			}
			return object;
		}
	},
	Compiler: {
		type$: Instance,
		construct: function(object, contextName) {
			const sys = this.sys;
			object[sys.symbols.compile] = "constructing";
			let type = object[""];
			if (sys.statusOf(type) && typeof type.expr == "string") {
				type = sys.forName(type.expr);
			}
			let target = Object.create(type || null);
			for (let name in object) {
				if (name) target[name] = object[name];
			}
			object[sys.symbols.compile] = "constructed";
			return target;
		},
		compileArray: function(array) {
			const sys = this.sys;
			array[sys.symbols.compile] = "compiling";			
			for (let i = 0; i < array.length; i++) {
				let value = array[i];
				if (sys.statusOf(value)) {
					if (value[""]) value = this.construct(value);
					this.compileProperties(value);
					array[i] = value;
				}
			}
			array[sys.symbols.compile] = "";	
			Object.freeze(array);
		},
		compileProperties: function(object, contextName) {
			object[this.sys.symbols.compile] = "compiling";
			for (let name in object) {
				this.compileProperty(object, name, contextName);
			}
			object[this.sys.symbols.compile] = "";
			//TODO finalize compilation (symbols, etc)
		},
		compileProperty: function(object, propertyName, contextName) {
			let value = object[propertyName];
			switch (this.sys.statusOf(value)) {
				case "property":
					if (this.sys.statusOf(value.expr)) {
						if (value.expr[""]) {
							value.expr = this.construct(value.expr, contextName);
						}
						this.compileProperties(value.expr);
					}
					let facet = this.sys.facets[value.facet];
					let descr = facet.process(value);
					facet.define(object, propertyName, descr);
					return;
				case "object":
					if (value[""]) {
						value = this.construct(value, contextName);
						object[propertyName] = value;
					}
					this.compileProperties(value);
					return;
				case "array":
					this.compileArray(value);
					return;
				case "":
				case undefined:
					return;
				default:
					console.error(`Invalid compilation status "${this.sys.statusOf(value)}"`);
					return;
			}
		}
	}
}