export default {
	type$: "/system.youni.works/core",
	Interface: {
		type$: "Instance",
		name: "",
//		type$module: "Module",
//		type$extends: "Interface",
//		type$implements: "Array", //of Interface
		type$prototype: "Object",
		properties: {
		}
	},
//	Module: {
//		type$: "Instance",
//		id: "",
//		version: "",
//		moduleType: "",
//		type$uses: "Array",
//		type$packages: "Parcel"
//	},
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
	},
	Modules: {
		type$: "Instance",
		use: {
			type$Module: "Module"
		},
		compile: function(source) {
			let module = this.sys.extend(this.use.Module, module);
			let pkgs = this.sys.extend();
			//Need to define the module packages prior to compiling packages to support in-module package deps.
			this.sys.packages[module.id] = pkgs;
			for (let name in module.packages) {
				pkgs[name] = this.compilePackage(name);
			}
			this.sys.define(module, "packages", pkgs);
			this.sys.define(sys.modules, module.id, module);
			Object.freeze(module);
			console.info("Loaded", module);
			return module;
		},
		compilePackage: function(module, name) {
			let pkg = module.packages[name];
			let ctxName = module.id + "/" + name;
			console.debug(`Compiling "${ctxName}"...`);
			pkg = this.sys.compile(pkg, ctxName);
			console.debug(`Compiled "${ctxName}".`);
			return pkg;
		}
	},
	Property: {
		type$: "Instance",
		facet: "",
		name: "",
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
	System: {
		type$: "Instance",
		use: {
			type$Property: "Property",
			Interface: null //Interfaces are not created for Types by default.
		},
		facets: {
		},
		symbols: {
		},
		extend: function(object, decls) {
			if (typeof object == "string") object = this.forName(object);
			object = Object.create(object || null);
			this.implement(object, decls);
			return object;
		},
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
		define: function(object, name, value, facetName) {
			let decl;
			if (facetName) {
				let facet = this.facets[facetName];
				if (!facet) {
					throw new Error(`Facet "${facetName}" does not exist.`);
				}
				decl = this.declare(facet, name, value);
				facet(decl);
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
		forName: function(name, component) {
			throw new Error("Unimplemented");
		},
		compile: function(value, contextName) {
			throw new Error("Unimplemented");
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
	}
}