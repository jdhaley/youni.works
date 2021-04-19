export default {
	Object: {
		symbol$sys: null				//sys is initialized during bootstrap
	},
	Parcel: {
		type$: "./Object"
	},
	Record: {
		type$: "./Object"
	},
	Array: {
		type$: "./Object",
		length: 0,
		symbol$iterator: function *() {
			for (let i = 0; i < this.length; i++) yield this[i];
		}
	},
	Instance: {
		type$: "./Object",
		get$sys: function() {
			return this[Symbol.sys];	//Symbol.sys - initialized by bootstrap
		},
		super: function(name, ...args) {
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
	},
	System: {
		type$: "./Instance",
		packages: {
		},
		facets: {
		},
		symbols: {
		},
		extend: function(object, decls) {
//			if (object === undefined) object = OBJECT;
			if (typeof object == "string") object = this.forName(object);
			object = Object.create(object || null);
			this.implement(object, decls);
			return object;
		},
		implement: function(object, decls) {
			for (let decl in decls) {
				let facet = this.facetOf(decl);
				let name = this.nameOf(decl);	
				let value = decls[decl];
				if (name) {
					this.define(object, name, value, facet);
				} else if (!object[Symbol.status]) {
					console.warn("Object declaration ignored in System.implement()");
				}
			}
		},
		define: function(object, name, value, facetName) {
			let decl;
			if (facetName) {
				let facet = this.facets[facetName];
				if (!facet) {
					throw new Error(`Facet "${facetName}" does not exist.`);
				}
				decl = facet({sys: this, facet: facet, name: name, expr: value});
				name = decl.name; //In case the facet (e.g. symbol$) changes it.
			} else {
				decl = {configurable: true, enumerable: true, writable: true, value: value};				
			}
			Reflect.defineProperty(object, name, decl);
		},
		facetOf: function(decl) {
			if (typeof decl == "symbol") return "";
			decl = "" + decl;
			let index = decl.indexOf("$");
			return index >= 0 ? decl.substr(0, index) : "";
		},
		nameOf: function(decl) {
			if (typeof decl == "symbol") return decl;
			decl = "" + decl;
			let index = decl.indexOf("$");
			return index >= 0 ? decl.substring(index + 1) : decl;
		},
		forName: function(name, component) {
			//console.log(`forName("${name}")`);
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
				context += (context ? "/" : "") + prop;
				if (this.statusOf(component[prop])) {
					this.compiler.compileProperty(component, prop, context);
				}
				component = component[prop];
			}
			//console.log(`got forName("${name}")`, component);
			return component;
		},
		compile: function(value, contextName) {
			if (this.packages["."]) {
				throw new Error("Compilation in progress.");
			}
			value = this.loader.loadValue(value, contextName);
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
		statusOf: function(value) {
			if (value && typeof value == "object") return value[Symbol.status];
		},
		////for compilation/////
		declare: function(facet, name, value) {
			return this.extend(null, {
				sys: this,
				facet: facet,
				name: name,
				expr: value
			});			
		},
		isSource: function(value) {
			if (value && typeof value == "object") {
				let proto = Object.getPrototypeOf(value);
				if (proto == Object.prototype || proto == Array.prototype) return true;
			}
			return false;
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
	Declaration: {
		type$: "./Instance",
		facet: "",
		name: "",
		expr: undefined
	},
	Loader: {
		type$: "./Instance",
		loadValue: function(value, componentName) {
			if (this.sys.statusOf(value)) throw new Error("Possible recursion.");

			if (value && typeof value == "object") {
				let proto = Object.getPrototypeOf(value);
				if (proto == Array.prototype) {
					value = this.loadArray(value, componentName);
				} else if (proto == Object.prototype) {
					value = this.loadObject(value, componentName);
				}
			}
			return value;
		},
		loadArray: function(source, componentName) {
			const sys = this.sys;
			let system = sys.forName("system.youni.works");
			let length = source.length;
			let array = sys.extend(system.Array, {
				length: length
			});
			array[Symbol.status] = "array";
			for (let i = 0; i < length; i++) {
				array[i] = this.loadValue(source[i], componentName + "/" + i);
			}
			return array;
		},
		loadObject: function(source, componentName) {
			const sys = this.sys;
			let object = sys.extend(null);
			object[Symbol.status] = "object";
			for (let decl in source) {
				let name = sys.nameOf(decl);
				let facet = sys.facetOf(decl);
				let value = this.loadValue(source[decl], componentName + "/" + name);
				if (facet) {
					if (facet == "type" && typeof value == "string") {
						console.info(componentName + "/" + name + " --> " + value);
					}
					value = sys.declare(facet, name, value);
					value[Symbol.status] = "property";
				}
				object[name] = value;
			}
			return object;
		}
	},
	Compiler: {
		type$: "./Instance",
		construct: function(object, contextName) {
			const sys = this.sys;
			object[Symbol.status] = "constructing";
			let type = object[""];
			if (sys.statusOf(type)) {
				type = type.expr;
				if (typeof type == "string") {
					type = sys.forName(type);
				}
			}
			let target = Object.create(type || null);
			for (let name in object) {
				if (name) sys.define(target, name, object[name]);
			}
			object[Symbol.status] = "constructed";
			return target;
		},
		compileArray: function(array, contextName) {
			const sys = this.sys;
			array[Symbol.status] = "compiling";			
			for (let i = 0; i < array.length; i++) {
				let value = array[i];
				if (sys.statusOf(value)) {
					if (value[""]) value = this.construct(value, contextName);
					this.compileProperties(value, contextName);
					array[i] = value;
				}
			}
			array[Symbol.status] = "";	
			Object.freeze(array);
		},
		compileProperties: function(object, contextName) {
			if (object[Symbol.status] == "compiling") {
//				throw new Error("Object is compiling.");
			}
			object[Symbol.status] = "compiling";
			//NB Don't include the prototype's enumerable properties!
			for (let name of Object.getOwnPropertyNames(object)) {
				if (name) this.compileProperty(object, name, contextName + "/" + name);
			}
			delete object[Symbol.status];
			//Can't freeze object because we need to assign sys to it.
			if (object[this.sys.symbols.type != "Object"]) Object.freeze(object);
		},
		compileProperty: function(object, propertyName, contextName) {
			let value = object[propertyName];
			switch (this.sys.statusOf(value)) {
				case "property":
					//Faceted properties will be defined at the end of this case.
					//Delete the property to handle symbol facets.
					delete object[propertyName];
					if (this.sys.statusOf(value.expr)) {
						if (value.expr[""]) {
							value.expr = this.construct(value.expr, contextName);
						}
						this.compileProperties(value.expr, contextName);
					}
					let facet = this.sys.facets[value.facet];
					value = facet(value);
					Reflect.defineProperty(object, value.name, value);
					return;
				case "object":
					if (value[""]) {
						value = this.construct(value, contextName);
						object[propertyName] = value;
						let firstChar = propertyName.charAt(0)
						if (firstChar.toUpperCase() == firstChar) {
							this.sys.define(value, this.sys.symbols.type, propertyName);
						}
					}
					this.compileProperties(value, contextName);
					return;
				case "array":
					this.compileArray(value);
					return;
				case "compiling":
				case "":
				case undefined:
					return;
				default:
					console.error(`Invalid compilation status "${this.sys.statusOf(value)}"`);
					return;
			}
		}
	},
	Module: {
		type$: "./Instance",
		id: "",
		version: "",
		moduleType: "",
		compile: function() {
			let sys = this.sys;
			let target;
			if (!this.packages && this.package) {
				console.debug(`Compiling "${this.id}"...`);
				target = sys.compile(this.package, this.id);
				sys.define(this, "package", target);
				sys.packages[this.id] = target;
				console.debug("Compiled.");
			} else {
				target = sys.extend();
				//Need to define the module packages here to support in-module package deps.
				sys.packages[this.id] = target;
				for (let name in this.packages) {
					let ctxName = this.id + "/" + name;
					let pkg = this.packages[name];
					console.debug(`Compiling "${ctxName}"...`);
					target[name] = sys.compile(pkg, ctxName);
					console.debug("Compiled.");
				}
				sys.define(this, "packages", target);				
			}
			Object.freeze(this);
			console.debug(this);
		}
	}
}
//Interface: {
//	type$: Instance,
//	properties: OBJECT,
//	applyTo: function(object) {
//		let props = this.properties;
//		for (let name in props) props[name].define(object);
//	}
//},

//Property: {
//type$: Instance,
//name: "",
//source: undefined,
//declare: function(name, value) {
//	return this.sys.extend(this, {
//		name: name,
//		source: value,
//		configurable: true,
//		enumerable: true
//	});
//},
//compile: null,
//define: function(object, contextName) {
//	try {
//		if (this.compile) {
//			this.compile(contextName);
//			this.sys.define(this, "compile", undefined);
//			Object.freeze(this);
//		}
//		Reflect.defineProperty(object, this.name, this);
//	} catch (error) {
//		contextName = contextName ? contextName + "/" + this.name : this.name;
//		error.message = `When defining "${contextName}": ${error.message}`;
//		throw error;
//	}
//}
//},

//define: function(object, contextName) {
//	try {
//		Reflect.defineProperty(object, this.name, this);
//	} catch (error) {
//		contextName = contextName ? contextName + "/" + this.name : this.name;
//		error.message = `When defining "${contextName}": ${error.message}`;
//		throw error;
//	}
//}

//
//Function.prototype.super = function(thisArg, ...args) {
//	for (let proto = Object.getPrototypeOf(thisArg); proto; proto = Object.getPrototypeOf(proto)) {
//		let protoValue = proto[this.name];
//		if (protoValue !== this) {
//			if (typeof protoValue == "function") return protoValue.apply(thisArg, args);
//			break;
//		}
//	}
//	throw new Error(`super "${this.name}" is not a method.`);
//}
//option 3: a method$ facet puts super on the function.

