export default {
	type$: "/system.youni.works/core",
	Engine: {
		type$: "System",
		use: {
			type$Object: "Object"
		},
		packages: {
		},
		facets: {
			type: function(decl) {
				decl.configurable = true;
				return decl;
			}
		},
		symbols: {
		},
		type$compiler: "Compiler",
		type$loader: "Loader",
		extend: function(object, decls) {
			if (object === undefined) object = this.use.Object;
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
				decl = facet({sys: this, facet: facet, name: name, expr: value});
				name = decl.name; //In case the facet (e.g. symbol$) changes it.
			} else {
				decl = {configurable: true, enumerable: true, writable: true, value: value};				
			}
			Reflect.defineProperty(object, name, decl);
		},
		forName: function(name) {
			//console.log(`forName("${name}")`);
			name = "" + (name || ""); //coerce/guard name arg.
			let component = this.packages;
			let context = "";
			if (name.startsWith("/")) {
				name = name.substring(1);
				context = "/";
			} else {
				component = component["."];
			}
			let path = name.split("/");
			for (let prop of path) {
				if (typeof component != "object") {
					console.error(`For name "${name}": "${context}" is not an object.`);
					return undefined;
				}
//allow prototype properties. The following was added when debugging system to reduce side-effects.
// if (!Reflect.getOwnPropertyDescriptor(component, prop)) {
				if (!component[prop]) {
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
		load: function(value, contextName) {
			
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
		}
	},
	Loader: {
		type$: "Instance",
		declare: function(facet, name, value) {
			return this.sys.extend(null, {
				sys: this.sys,
				facet: facet,
				name: name,
				expr: value,
				[Symbol.status]: "property"
			});
		},
		loadValue: function(value, componentName) {
			if (this.sys.statusOf(value)) throw new Error("Possible recursion.");

			if (value && typeof value == "object") {
				let proto = Object.getPrototypeOf(value);
				if (proto == Array.prototype) {
					value = this.loadArray(value, componentName);
				} else if (proto == Object.prototype) {
					value = this.loadObject(value, componentName);
				} else if (proto == Function.prototype && value.name == "expr$") {
					value[Symbol.status] = "expr";
				}
			}
			return value;
		},
		loadArray: function(source, componentName) {
			const sys = this.sys;
			let length = source.length;
			let array = sys.extend("/system.youni.works/core/Array", {
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
						console.debug(componentName + "/" + name + " --> " + value);
					}
					value = this.declare(facet, name, value);
				}
				object[name] = value;
			}
			return object;
		}
	},
	Compiler: {
		type$: "Instance",
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
			object[Symbol.status] = "compiling";
			//NB Don't include the prototype's enumerable properties!
			for (let name of Object.getOwnPropertyNames(object)) {
				if (name) this.compileProperty(object, name, contextName + "/" + name);
			}
			delete object[Symbol.status];
			//Can't freeze core/Object because we need to assign sys to it.
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
				case "expr":
					value.call(this, object, propertyName);
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
		type$: "Instance",
		id: "",
		version: "",
		moduleType: "",
		uses: [],
		packages: {
		},
		compile: function() {
			let target = this.sys.extend();
			//Need to define the module packages here to support in-module package deps.
			this.sys.packages[this.id] = target;
			for (let name in this.packages) {
				target[name] = this.compilePackage(name);
			}
			this.sys.define(this, "packages", target);				
			Object.freeze(this);
			console.info("Loaded", this);
		},
		compilePackage: function(name) {
			let pkg = this.packages[name];
			let ctxName = this.id + "/" + name;
			console.debug(`Compiling "${ctxName}"...`);
			pkg = this.sys.compile(pkg, ctxName);
			console.debug(`Compiled "${ctxName}".`);
			return pkg;
		}
	}
}