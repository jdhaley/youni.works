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
			for (let propertyName of path) {
				if (typeof component != "object") {
					console.error(`For name "${name}": "${context}" is not an object.`);
					return undefined;
				}
				switch (this.statusOf(component)) {
					case "Parcel":
					case undefined:
						break;
					default:
						console.warn(`For name "${name}: "${context}" has status of "${this.statusOf(component)}"`);
				}
				//allow prototype properties. The following was added when debugging system to reduce side-effects.
				// if (!Reflect.getOwnPropertyDescriptor(component, propertyName)) {
				if (!component[propertyName]) {
					console.error(`For name "${name}": "${context}" does not define "${propertyName}".`);
					return undefined;
				}
				context += (context ? "/" : "") + propertyName;
				if (this.statusOf(component[propertyName])) {
					//the property name is extracted from the context:
					this.compiler.compileProperty(component, context);
				}
				component = component[propertyName];
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
		compile: function(value, contextName) {
			if (this.packages["."]) {
				throw new Error("Compilation in progress.");
			}
			value = this.loader.loadValue(value, contextName);
			if (this.statusOf(value)) {
				if (value[""]) {
					value = this.compiler.compileObject(value, contextName);
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
		declare: function(facet, name, value) {
			return this.extend(null, {
				sys: this,
				facet: facet,
				name: name,
				expr: value,
				[Symbol.status]: "Property"
			});
		},
		resolve: function(value, parent, name) {
			switch (this.statusOf(value)) {
				case "Object":
					let extend = value[""];
					if (this.statusOf(extend) == "Property") {
						if (typeof extend.expr == "string") {
							extend = this.forName(extend.expr);
						}
					}
					let target = Object.create(extend);
					for (let name in value) {
						if (name) this.define(target, name, value[name]);
					}
					target[Symbol.status] = "Parcel";
					parent[name] = target;
					console.debug(`Created Object "${name}" in `, parent);
					this.resolve(target);
					break;
				case "Array":
					for (let ele of value) this.resolve(ele);
					break;
				case "Parcel":
					for (let name of Object.getOwnPropertyNames(value)) {
						this.resolve(value[name], value, name);
					}
					break;
				case "Property":
					if (value.name && value.facet == "type" && typeof value.expr == "string") {
						console.debug(value.name + " --> " + value.expr);
					} else {
						this.resolve(value.expr);
					}
					break;
			}
		}
	},
	Loader: {
		type$: "Instance",
		loadValue: function(value, componentName) {
			if (this.sys.statusOf(value)) {
				console.warn("Loading cycle detected.");
				return value;
			}
			if (value && typeof value == "object") {
				let proto = Object.getPrototypeOf(value);
				if (proto == Array.prototype) {
					value = this.loadArray(value, componentName);
				} else if (proto == Object.prototype) {
					value = this.loadObject(value, componentName);
				}
			} else if (typeof value == "function") {
				value = this.loadFunction(value, componentName);
			}
			return value;
		},
		loadFunction: function(source, componentName) {
			 if (source.name == "expr$") {
				 source[Symbol.status] = "Expr";
			 } else if (componentName) {
				 source[this.sys.symbols.name] = componentName;
			 }
			 return source;
		},
		loadArray: function(source, componentName) {
			const sys = this.sys;
			let length = source.length;
			let array = sys.extend("/system.youni.works/core/Array", {
				length: length
			});
			array[Symbol.status] = "Array";
			for (let i = 0; i < length; i++) {
				array[i] = this.loadValue(source[i], componentName + "/" + i);
			}
			if (componentName) array[sys.symbols.name] = componentName;
			return array;
		},
		loadObject: function(source, componentName) {
			const sys = this.sys;
			let object = sys.extend(null);
			for (let decl in source) {
				let name = sys.nameOf(decl);
				let facet = sys.facetOf(decl);
				//	if (facet == "type" && typeof value == "string") {
				//		console.debug(componentName + "/" + name + " --> " + value);
				//	}
				let value = this.loadValue(source[decl], componentName + "/" + name);
				if (facet) value = this.sys.declare(facet, name, value);
				object[name] = value;
			}
			object[Symbol.status] = object[""] ? "Object" : "Parcel";
			if (componentName) object[sys.symbols.name] = componentName;
			return object;
		},
	},
	Compiler: {
		type$: "Instance",
		compileValue: function(value, contextName) {
		},
		compileObject: function(object, contextName) {
			if (!object[""]) console.error("No type property for 'Object' status.");
			const sys = this.sys;
			const tag = object[sys.symbols.type];
			const name = object[sys.symbols.name];
			object[Symbol.status] = "constructing";
			let type = object[""];
			if (sys.statusOf(type)) {
				type = type.expr;
				if (typeof type == "string") {
					type = sys.forName(type);
				}
			}
			let target = Object.create(type || null);
			if (tag) target[sys.symbols.type] = tag;
			if (name) target[sys.symbols.name] = name;
			for (let name in object) {
				if (name) sys.define(target, name, object[name]);
			}
			object[Symbol.status] = "constructed";

			return target;
		},
		compileArray: function(array, contextName) {
			const sys = this.sys;
			delete array[Symbol.status];	
			for (let i = 0; i < array.length; i++) {
				let value = array[i];
				if (sys.statusOf(value)) {
					if (value[""]) value = this.compileObject(value, contextName);
					this.compileProperties(value, contextName);
					array[i] = value;
				}
			}
			Object.freeze(array);
			return array;
		},
		compileProperties: function(object, contextName) {
			delete object[Symbol.status];
			//NB Don't include the prototype's enumerable properties!
			for (let name of Object.getOwnPropertyNames(object)) {
				if (name) {
					this.compileProperty(object, contextName + "/" + name);
				}
			}
			//Can't freeze core/Object because we need to assign sys to it.
			if (object[this.sys.symbols.type != "Object"]) Object.freeze(object);
			return object;
		},
		compileProperty: function(object, contextName) {
			const propertyName = contextName.substring(contextName.lastIndexOf("/") + 1);
			let value = object[propertyName];
			switch (this.sys.statusOf(value)) {
				case "Property":
					//Faceted properties will be defined at the end of this case.
					//Delete the property to handle symbol facets.
					delete object[value.name];
					if (this.sys.statusOf(value.expr)) {
						if (value.expr[""]) {
							value.expr = this.compileObject(value.expr, contextName);
						}
						this.compileProperties(value.expr, contextName);
					}
					let facet = this.sys.facets[value.facet];
					value = facet(value);
					Reflect.defineProperty(object, value.name, value);
					return;
				case "Parcel":
					this.compileProperties(value);
					return;
				case "Object":
					let firstChar = propertyName.charAt(0)
					if (firstChar.toUpperCase() == firstChar) {
						value[this.sys.symbols.type] = propertyName;
					}
					value = this.compileObject(value, contextName);
					object[propertyName] = value;
					this.compileProperties(value, contextName);
					return;
				case "Array":
					this.compileArray(value);
					return;
				case "Expr":
					value.call(this.sys, object, propertyName);
					return;
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