export default {
	type$: "/system.youni.works/reflect",
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
				let value = this.sys.parser.parse(decls[decl]);
				this.sys.define(object, name, value, facet);
				if (this.statusOf(value)) this.compile(object, name);
			}
			for (let symbol of Object.getOwnPropertySymbols(decls)) {
				this.sys.define(object, symbol, decls[symbol]);				
			}
		},
		getValue: function(name, fromName) {
			if (typeof name != "string") {
				throw new TypeError(`"name" argument must be a "string".`);
			}
			if (!name) return null;
			let component = this.public;
			if (name.startsWith("/")) {
				name = name.substring(1);
			} else {
				component = component["."];
			}
			return this.sys.compiler.resolve(component, name, fromName);
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
					this.sys.define(value, "of", object);
					value.define(object);
					return;
				case "Array":
				case "Parcel":
					this.compileStructure(value);
					value[this.sys.symbols.of] = object;
					return;
				case "Instance":
					let target = this.constructInstance(value);
					this.sys.define(object, key, target);
					let firstChar = key.charAt(0)
					if (firstChar.toUpperCase() == firstChar && firstChar.toLowerCase() != firstChar) {
						this.sys.define(target, this.sys.symbols.tag, key);
						let cls = this.compileClass(target, value);
						//cls[this.sys.symbols.of] = object;
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
			method.of = object;
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
			//Object.freeze(object);
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
			const sym = this.sys.symbols;

			this.compileTarget(target, properties);
			
			if (!this.sys.use.Interface) return;

			let iface = this.sys.extend(this.sys.use.Interface, {
				of: null,
				name: "",
				class: target,
				implements: null,
				properties: null
			});
			iface.compile(properties);
			return iface;
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