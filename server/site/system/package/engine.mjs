export default {
	type$: "/system.youni.works/reflect",
	Loader: {
		type$: "Instance",
		load: function(value, componentName) {
			if (this.sys.compiler.statusOf(value)) {
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
				if (Object.isFrozen(source)) {
					return source;
				}	
				source[Symbol.status] = "Method";
				source[this.sys.symbols.name] = componentName;
			}
			return source;
		},
		loadArray: function(source, componentName) {
			const sys = this.sys;
			let length = source.length;
			let array = sys.extend(sys.use.Array, {
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
		statusOf: function(value) {
			if (value && (typeof value == "object" || typeof value == "function")) {
				return value[Symbol.status];
			} 
		},
		implement: function(object, decls) {
			for (let decl of Object.getOwnPropertyNames(decls)) {
				let facet = this.sys.facetOf(decl);
				let name = this.sys.nameOf(decl);
				if (!name && !object[Symbol.status]) {
					console.warn("Object declaration ignored in Engine.implement()");
					break;
				}
				let value = decls[decl];
				if (this.loader) value = this.sys.loader.load(value);
				if (this.statusOf(value)) {
					this.compile(decls, decl);
					value = decls[decl];
				}
				this.sys.define(object, name, value, facet);
			}
			for (let symbol of Object.getOwnPropertySymbols(decls)) {
				this.sys.define(object, symbol, decls[symbol]);				
			}
		},
		resolve: function(component, name, fromName) {
			let componentName = "";
			for (let propertyName of name.split("/")) {
				if (typeof component != "object") return error("is not an object.");
				if (!component[propertyName]) return error(`does not define "${propertyName}".`);
				if (this.statusOf(component)) return error(`has status of "${this.statusOf(component)}"`);
				if (this.statusOf(component[propertyName])) {
					this.compile(component, propertyName);
				}
				component = component[propertyName];
				componentName += (componentName ? "/" : "") + propertyName;
			}
			return component;

			function error(msg) {
				let err = fromName ? `From "${fromName}"... ` : "For ";
				err += `name "${name}": "${componentName}" ` + msg;
				console.error(err);
			}
		},
		compile: function(object, key) {
			let value = object[key];
			switch (this.statusOf(value)) {
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
				case "Expr":
					value.call(this.sys, object, key);
					return;
				case "Method":
					this.compileMethod(object, key);
					return;
				case undefined:
					return;
				default:
					console.error(`Invalid compilation status "${this.statusOf(value)}"`);
					return;
			}
		},
		compileMethod: function(object, name) {
			let method = object[name];
			method.$super = this.sys.getSuper(object, name);
			method.definedIn = object;
			delete method[Symbol.status];
			delete method[this.sys.symbols.name];
			Object.freeze(method);
		},
		compileProperty: function(value) {
			this.compile(value, "expr");
			let fn = this.sys.facets[value.facet];
			if (fn) {
				fn(value);
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
		compileTarget: function(target, properties) {
			for (let name in properties) {
				if (name) this.sys.define(target, name, properties[name]);
			}
			//NB! Only iterate over the target's own properties
			for (let name of Object.getOwnPropertyNames(target)) {
				this.compile(target, name);
			}
		},
		compileClass: function(target, properties) {
			this.compileTarget(target, properties);
			
			if (!this.sys.use.Interface) return;

			let iface = this.sys.extend(this.sys.use.Interface, {
				of: null,
				name: properties[this.sys.symbols.name],
				class: target,
				implements: null,
				properties: null
			});
			iface.compile(properties);
		},
		constructInstance: function(object) {
			let iname = object[this.sys.symbols.name];
			if (iname == "system.youni.works/core/Object") {
				return this.sys.use.Object;
			}
			object[Symbol.status] = "[Constructing]";
			let type = object[""];
			if (this.statusOf(type) == "Property") {
				type = type.expr;
			}
			if (typeof type == "string") {
				type = this.sys.forName(type, iname);
			}
			if (!type || Object.getPrototypeOf(type) != this.sys.use.Array) {
				return Object.create(type || null);
			}
			let proto = type[0];
			if (typeof proto == "string") {
				proto = this.sys.forName(proto, iname);
			}
			let target = Object.create(proto  || null);
			for (let i = 1; i < type.length; i++) {
				let proto = type[i];
				if (typeof proto == "string") proto = this.sys.forName(proto, iname);
				let iface = proto ? proto[this.sys.symbols.interface] : undefined;
				if (iface) {
					iface.implementOn(target);
				} else {
					console.error(`No interface for "${type[i]}"`);
				}
			}
			return target;
		}
	}
}