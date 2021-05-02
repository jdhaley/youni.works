export default {
	type$: "/system.youni.works/reflect",
	Engine: {
		type$: "System",
		facets: {
		},
		symbols: {
		},
		packages: {
		},
		type$compiler: "Compiler",
		type$loader: "Loader",
		implement: function(object, decls) {
			if (decls && Object.getPrototypeOf(decls) == this.use.Interface) {
				for (let name in decls.properties) {
					if (name) {
						let value = decls.properties[name];
						if (value && Object.getPrototypeOf(value) == this.use.Property) {
							value.define(object);
						} else {
							this.define(object, name, value);
						}
					}
				}
			}
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
		forName: function(name) {
			if (typeof name != "string") {
				throw new TypeError(`"name" argument must be a "string".`);
			}
			if (!name) return null;
			let component = this.packages;
			if (name.startsWith("/")) {
				name = name.substring(1);
			} else {
				component = component["."];
			}
			return this.compiler.resolve(component, name);
		},
		compile: function(value, componentName) {
			if (this.packages["."]) {
				throw new Error("Compilation in progress.");
			}
			value = this.loader.load(value, componentName);
			this.packages["."] = value;
			this.compiler.compile(this.packages, ".");
			value = this.packages["."];
			delete this.packages["."];
			return value;
		},
		statusOf: function(value) {
			if (value && typeof value == "object") return value[Symbol.status];
		}
	},
	Loader: {
		type$: "Instance",
		load: function(value, componentName) {
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
				array[i] = this.load(source[i], componentName + "/" + i);
			}
			if (componentName) sys.define(array, sys.symbols.name, componentName);
			return array;
		},
		loadObject: function(source, componentName) {
			const sys = this.sys;
			let object = sys.extend();
			for (let decl in source) {
				let name = sys.nameOf(decl);
				let facet = sys.facetOf(decl);
				let value = this.load(source[decl], componentName + "/" + name);
				if (facet) {
					value = this.sys.declare(facet, name, value);
					value[Symbol.status] = "Property";
				}
				object[name] = value;
			}
			object[Symbol.status] = object[""] ? "Instance" : "Parcel";
			if (componentName) sys.define(object, sys.symbols.name, componentName);
			return object;
		}
	},
	Compiler: {
		type$: "Instance",
		compile: function(object, key) {
			let value = object[key];
			switch (this.sys.statusOf(value)) {
				case "Expr":
					value.call(this.sys, object, key);
					return;
				case "Property":
					this.compileProperty(value);
					value.define(object);
					return;
				case "Array":
				case "Parcel":
					this.compileStructure(value);
					return;
				case "Instance":
					let target = this.constructInstance(value);
					this.sys.define(object, key, target);
					let firstChar = key.charAt(0)
					if (firstChar.toUpperCase() == firstChar && firstChar.toLowerCase() != firstChar) {
						this.sys.define(target, this.sys.symbols.tag, key);
						this.compileClass(target, value);
					} else {
						this.compileTarget(target, value);
						Object.freeze(target);
					}
					return;
				case undefined:
					return;
				default:
					console.error(`Invalid compilation status "${this.sys.statusOf(value)}"`);
					return;
			}
		},
		resolve: function(component, name) {
			let componentName = ""; //(component == this.sys.packages ? "/" : "");
			for (let propertyName of name.split("/")) {
				//name, component, componentName, propertyName
				if (typeof component != "object") {
					console.error(`For name "${name}": "${componentName}" is not an object.`);
					return undefined;
				}
				//allow prototype properties. The following was added when debugging system to reduce side-effects.
				if (!component[propertyName]) {
					console.error(`For name "${name}": "${componentName}" does not define "${propertyName}".`);
					return undefined;
				}
				if (this.sys.statusOf(component)) {
					console.warn(`For name "${name}: "${componentName}" has status of "${this.statusOf(component)}"`);
				}
				if (this.sys.statusOf(component[propertyName])) {
					this.compile(component, propertyName);
				}
				component = component[propertyName];
				componentName += (componentName ? "/" : "") + propertyName;
			}
			return component;
		},
		compileProperty: function(value) {
			this.compile(value, "expr");
			let facet = this.sys.facets[value.facet];
			if (facet) {
				facet(value);
			} else {
				console.error(`For "${object[sys.symbols.name]}/${key}": Facet "${value.facet}" not defined`);
				value.value = value.expr;
			}
		},
		compileStructure: function(object) {
			delete object[Symbol.status];
			for (let name in object) {
				this.compile(object, name);
			}
			delete object[this.sys.symbols.name];
			Object.freeze(object);
		},
		compileClass: function(target, properties) {
			this.compileTarget(target, properties);
			
			if (!this.sys.use.Interface) return;

			for (let name in properties) {
				let value = properties[name];
				if (this.sys.statusOf(value) == "Property") {
					this.compileProperty(value);
					delete value[Symbol.status];
					Object.freeze(value);
				} else {
					this.compile(properties, name);
				}
			}
			let name = properties[this.sys.symbols.name];
			delete properties[this.sys.symbols.name];
			delete properties[Symbol.status];
			Object.freeze(properties);
			
			let iface = this.sys.extend(this.sys.use.Interface, {
				name: name,
				prototype: target,
				properties: properties
			});
			this.sys.define(target, this.sys.symbols.interface, iface);
			if (target == this.sys.use.Object) {
				this.sys.define(target, this.sys.symbols.sys, this.sys);
			} else {
				Object.freeze(target);				
			}
		},
		compileTarget: function(target, properties) {
			for (let name in properties) {
				if (name) this.sys.define(target, name, properties[name]);
			}
			//NB! Only iterate over the target's own properties
			for (let name of Object.getOwnPropertyNames(target)) {
				this.compile(target, name);
			}
		},
		constructInstance: function(object) {
			if (object[this.sys.symbols.name] == "system.youni.works/core/Object") {
				return this.sys.use.Object;
			}
			object[Symbol.status] = "[Constructing]";
			let proto = object[""];
			if (this.sys.statusOf(proto) == "Property") {
				proto = proto.expr;
				if (typeof proto == "string") {
					proto = this.sys.forName(proto);
				}
			}
			return Object.create(proto || null);
		}
	}
}