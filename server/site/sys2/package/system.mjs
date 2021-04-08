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
					delete this.compile;
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
			for (let prop of path.split()) {
				if (component === undefined || component === null) {
					console.error(`"${context}" does not exist for name "${name}".`);
					return undefined;
				}
				if (typeof component != "object") {
					console.error(`"${context}" is not an object for name "${name}".`);
					return undefined;
				}
				if (component[this.symbols.status] && component[this.symbols.type]) {
					console.error(`"${context}" is an uncompiled object for name "${name}".`);
					return undefined;										
				}
				if (!Reflect.getOwnPropertyDescriptor(component, prop)) {
					console.error(`"${context}" does not define "${prop}" for name "${name}"`);
					return undefined;					
				}
				let value = component[prop];
				if (this.statusOf(value)) {
					value = compile.call(this, component, prop, context);
				}
				component = value;
				context += "/" + prop;
			}
			return component;
		},
		statusOf: function(value) {
			if (value && typeof value == "object") return value[this.symbols.status];
		}
	}
}

function compile(component, name, context) {
	let prop = component[name];
	switch (prop[this.symbols.status]) {
		case "declared":
			prop.define(component, context);
			return component[name];
		case "loaded":
			value[STATUS] = "compiling";
			let object = value;
			let type = value[sys.symbols.type];
			if (type) {
				if (typeof type == "string") type = sys.forName(type);
				object = Object.create(type || null);
			}
			for (let name in value) {
				object[name] = compileValue(sys, value[name]);
			}
			return object;			
	}
}
