export default {
	type$: "/system.youni.works/reflect",
	Engine: {
		type$: "System",
		type$compiler: "Compiler",
		type$loader: "Loader",
		packages: {
		},
		forName: function(name) {
			//console.log(`forName("${name}")`);
			if (typeof name != "string") {
				throw new TypeError(`"name" argument must be a "string".`);
			}
			let component = this.packages;
			let componentName = "/";
			if (name.startsWith("/")) {
				name = name.substring(1);
			} else {
				component = component["."];
				componentName = "";
			}
			let path = name.split("/");
			for (let propertyName of path) {
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
				if (this.statusOf(component)) {
					console.warn(`For name "${name}: "${componentName}" has status of "${this.statusOf(component)}"`);
				}
				if (this.statusOf(component[propertyName])) {
					this.compiler.compileProperty(component, propertyName);
				}
				component = component[propertyName];
				componentName += (componentName ? "/" : "") + propertyName;
			}
			//console.log(`got forName("${name}")`, component);
			return component;
		},
		compile: function(value, componentName) {
			if (this.packages["."]) {
				throw new Error("Compilation in progress.");
			}
			value = this.loader.load(value, componentName);
			this.packages["."] = value;
			this.compiler.compileProperty(this.packages, ".");
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
			object[Symbol.status] = object[""] ? "Object" : "Properties";
			if (componentName) sys.define(object, sys.symbols.name, componentName);
			return object;
		}
	},
	Compiler: {
		type$: "Instance",
		constructObject: function(object) {
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
			if (tag) sys.define(target, sys.symbols.type, tag);
			if (name) sys.define(target, sys.symbols.name, name);
			for (let name in object) {
				if (name) sys.define(target, name, object[name]);
			}
			object[Symbol.status] = "constructed";

			return target;
		},
		compileArray: function(array) {
			const sys = this.sys;
			delete array[Symbol.status];	
			for (let i = 0; i < array.length; i++) {
				this.compileProperty(array, i);
			}
			delete array[sys.symbols.name];
			Object.freeze(array);
			return array;
		},
		compileProperties: function(object) {
			delete object[Symbol.status];
			//NB Don't include the prototype's enumerable properties!
			for (let name of Object.getOwnPropertyNames(object)) {
				this.compileProperty(object, name);
			}
//			for (let name of Object.getOwnPropertyNames(object)) {
//				let value = object[name];
//				console.log(name, value);
//				if (typeof value == "object" && Object.getPrototypeOf(value) == this.sys.use.Property) {
//					value.define(object);
//				}
//			}
			
			let componentName = object[this.sys.symbols.name];
			delete object[this.sys.symbols.name];
			//Can't freeze core/Object because we need to assign sys to it.
			if (componentName != "system.youni.works/core/Object") {
				// console.debug("Freeze " + componentName);
				Object.freeze(object);
			}
			return object;
		},
//		implementProperties: function(object, properties) {
//			for (let name in properties) {
//				
//			}
//		},
		compileProperty: function(object, key) {
			let value = object[key];
			switch (this.sys.statusOf(value)) {
				case "Property":
					this.compileProperty(value, "expr");
					let facet = this.sys.facets[value.facet];
					if (facet) {
						value = facet(value);
						object[key] = value;
					} else {
						console.error(`For "${object[sys.symbols.name]}/${key}": Facet "${value.facet}" not defined`);
						value.value = value.expr;
					}
					value.define(object);
					return;
				case "Object":
					let firstChar = key.charAt(0)
					if (firstChar.toUpperCase() == firstChar) {
						value[this.sys.symbols.type] = key;
					}
					value = this.constructObject(value);
					this.sys.define(object, key, value);
					this.compileProperties(value);
					return;
				case "Properties":
					this.compileProperties(value);
					return;
				case "Array":
					this.compileArray(value);
					return;
				case "Expr":
					value.call(this.sys, object, key);
					return;
				case undefined:
					return;
				default:
					console.error(`Invalid compilation status "${this.sys.statusOf(value)}"`);
					return;
			}
		}
	}
}