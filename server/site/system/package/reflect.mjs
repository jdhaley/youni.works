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
		type$prototype: "Object",
		type$extends: "Interface",
		implements: [], //Array of Interface or string types.
		properties: {
		},
		get$extends: function() {
			const sym = this.sys.symbols.interface;
			let sup = Object.getPrototypeOf(this.prototype);
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
		}
//		type$module: "Module",
//		type$implements: "Array", //of Interface
	},
	Package: {
		type$: "Element",
		type$of: "Module",
		source: {
		},
		public: {
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
		compile: function(packages) {
			let target = this.sys.extend();
			//Need to define the module packages here to support in-module package deps.
			this.sys.packages[this.id] = target;
			for (let name in packages) {
				let ctxName = this.id + "/" + name;
				console.debug(`Compiling "${ctxName}"...`);
				let pkg = packages[name];
				target[name] = this.sys.compile(pkg.$public ? pkg.$public : pkg, ctxName);
				console.debug(`Compiled "${ctxName}".`);
			}
			Object.freeze(target);
			this.sys.define(this, "packages", target);
			Object.freeze(this);
			console.info(`Compiled "${this.id}"`, this);
		}
	},
	System: {
		type$: "Instance",
		use: {
			type$Object: "Object",
			type$Array: "Array",
			type$Property: "Property",
			type$Interface: "Interface",
			type$Module: "Module"
		},
		facets: {},
		symbols: {},
		packages: {},
		type$compiler: "Compiler",
		type$loader: "Loader",
		extend: function(object, decls) {
			if (typeof object == "string") object = this.forName(object);
			object = Object.create(object || null);
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
			value = this.loader.load(value, componentName);
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
	Loader: {
		load: function(value, componentName) {
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