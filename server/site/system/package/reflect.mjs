export default {
	type$: "/system.youni.works/core",
	Element: {
		type$: "Object",
		type$of: "Element",
		name: "",
		get$id: function() {
			return this.of.id + "/" + this.name;
		},
		get$sys: function() {
			return this[Symbol.sys]; //Symbol.sys is defined through bootstrapping.
		}
	},
	Property: {
		type$: "Element",
		type$of: "Interface",
		facet: "",
		expr: undefined,
		configurable: true,
		/*
		 * ECMAScript descriptor properties are added through the facet.
		 * define() will fail if the facet isn't first called.
		 */
		define: function(object) {
			Reflect.defineProperty(object, this.name, this);
		}
	},
	Interface: {
		type$: "Element",
		type$of: "Package",
		type$class: "",
		implements: [], //Array of Interface or string types.
		properties: {
		},
		get$extends: function() {
			const sym = this.sys.symbols.interface;
			let sup = Object.getPrototypeOf(this.class);
			if (sup && Object.prototype.hasOwnProperty.call(sup, sym)) return sup[sym];
		},
		isOn: function(object) {
			const sym = this.sys.symbols.interface;
			if (typeof object == "object") while (object) {
				if (object[sym] == this) return true;
				object = Object.getPrototypeOf(object);
			}
			return false;
		},
		implementOn: function(object) {
			if (this.isOn(object)) {
				console.warn(`Interface "${this.name}" already implemented on object.`);
				return;
			}
			let sup = this.extends;
			if (sup) sup.implementOn(object);
			for (let name in this.properties) {
				if (!name) continue;
				let value = this.properties[name];
				if (value && Object.getPrototypeOf(value) == this.sys.use.Property) {
					value.define(object);
				} else {
					this.sys.define(object, name, value);
				}
			}
		},
		compile: function(properties) {
			const sym =  this.sys.symbols;

			this.properties = properties;
			this.of = properties[sym.of];
			this.name = properties[sym.name];
			this.implements = this.compileImplements(properties[""]),

			this.compileInterfaceProperties();

			this.sys.define(this.class, sym.interface, this);
			if (this.class == this.sys.use.Object) {
				this.sys.define(this.class, sym.sys, this.sys);
			} else {
				Object.freeze(this.class);				
			}

		},
		compileImplements: function(type) {
			let types = this.sys.extend(this.sys.use.Array);
			if (type && Object.getPrototypeOf(type.expr) == this.sys.use.Array) {
				type = type.expr;
				types = this.sys.extend(types);
				for (let i = 1; i < type.length; i++) {
					let itype = type[i];
					if (typeof itype == "string") itype = this.sys.forName(itype);
					if (itype) itype = itype[this.sys.symbols.interface];
					if (itype) {
						Array.prototype.push.call(types, itype);
					}
				}
			}
			Object.freeze(types);
			return types;
		},
		compileInterfaceProperties: function() {
			let properties = this.properties;
			delete properties[""];

			for (let name in properties) {
				let value = properties[name];
				if (value && typeof value == "object" && Object.getPrototypeOf(value) == this.sys.use.Property) {
					this.sys.define(value, "of", this);
					delete value[Symbol.status];
					Object.freeze(value);
				}
				//  else {
				// 	this.compile(properties, name);
				// }
			}

			//delete properties[this.sys.symbols.name];
			delete properties[Symbol.status];
			
			
			Object.freeze(properties);
		}
	},
	Package: {
		type$: "Element",
		type$of: "Module",
		public: {
		},
		compile: function(source) {			
			let src = source.$public || source;
			let ctxName = this.of.id + "/" + this.name;
			console.debug(`Compiling "${ctxName}"...`);
			this.public = this.sys.compile(src, ctxName);
			console.debug(`Compiled "${ctxName}".`);
			return Object.freeze(this);
		}
	},
	Module: {
		type$: "Element",
		get$id: function() {
			return this.name + ":" + this.version
		},
		version: "0.0.0",
		moduleType: "",
		uses: [],
		packages: {
		},
		public: {
		},
		compile: function(packages) {
			this.sys.define(this, "public", this.sys.extend());

			this.sys.define(this, "packages", this.sys.extend());
			//Need to define the module packages here to support in-module package deps.
			this.sys.packages[this.id] = this.public;
			for (let name in packages) {
				let pkg = this.sys.extend(this.sys.use.Package, {
					of: this,
					name: name,
					public: null
				});
				this.packages[name] = pkg.compile(packages[name]);
				this.public[name] = pkg.public;
			}
			Object.freeze(this.packages);
			Object.freeze(this.public);
			Object.freeze(this);
			console.info(`Compiled "${this.id}"`, this);
		},
		//Development & Experimental follows:
		create: function(prototype, decls) {
			if (typeof prototype == "string") prototype = this.forName(prototype);
			//TODO this.use.Object needs to be fixed.
			prototype = Object.create(prototype || this.use.Object || null);
			this.sys.implement(prototype, decls);
			return prototype;
		},
		forName: function(name, fromName) {
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
	},
	System: {
		type$: "Instance",
		use: {
			type$Object: "Object",
			type$Array: "Array",
			type$Property: "Property",
			type$Interface: "Interface",
			type$Package: "Package",
			type$Module: "Module"
		},
		facets: {},
		symbols: {},
		packages: {},
		type$parser: "Parser",
		type$compiler: "Compiler",
		extend: function(object, decls) {
			if (typeof object == "string") object = this.forName(object);
			object = Object.create(object || this.use.Object || null);
			this.implement(object, decls);
			return object;
		},
		implement: function(object, decls) {
			if (decls && Object.getPrototypeOf(decls) == this.use.Interface) {
				decls.implementOn(object);
				return;
			}
			if (decls && typeof decls == "object") {
				this.compiler.implement(object, decls);
				return;
			}			
		},
		define: function(object, name, value, facet) {
			let decl;
			if (facet) {
				let fn = this.facets[facet];
				if (!fn) {
					throw new Error(`Facet "${facet}" does not exist.`);
				}
				decl = this.declare(facet, name, value);
				fn(decl);
				decl.define(object);
			} else {
				Reflect.defineProperty(object, name, {
					configurable: true,
					enumerable: true,
					writable: true,
					value: value
				});
			}
		},
		declare: function(facet, name, value) {
			return this.extend(this.use.Property, {
				facet: facet,
				name: name,
				expr: value
			});
		},
		forName: function(name, fromName) {
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
			return this.compiler.resolve(component, name, fromName);
		},
		getSuper: function(object, name) {
			if (!object) return;
			const sub = object[name];
			const OGP = Object.getPrototypeOf;
			if (sub) for (object = OGP(object); object; object = OGP(object)) {
				let sup = object[name];
				if (sup !== sub) return sup;
			}
		},
		compile: function(value, componentName) {
			if (this.packages["."]) {
				throw new Error("Compilation in progress.");
			}
			value = this.parser.parse(value, componentName);
			this.packages["."] = value;
			this.compiler.compile(this.packages, ".");
			value = this.packages["."];
			delete this.packages["."];
			return value;
		},
		facetOf: function(decl) {
			if (typeof decl == "symbol") return "";
			decl = "" + decl;
			let index = decl.indexOf("$");
			return index < 0 ? "" : decl.substr(0, index);
		},
		nameOf: function(decl) {
			if (typeof decl == "symbol") return decl;
			decl = "" + decl;
			let index = decl.indexOf("$");
			return index < 0 ? decl : decl.substring(index + 1);
		}
	},
	Parser: {
		parse: function(source, componentName) {
			throw new Error("Abstract");
		}
	},
	Compiler: {
		type$: "Instance",
		//Instead of being abstract, a simple implementation is defined for booting the system.
		implement: function(object, decls) {
			throw new Error("Abstract");
		},
		resolve: function(name, fromName) {
			throw new Error("Abstract");
		},
		compile: function(value, name) {
			throw new Error("Astract");
		}
	}
}