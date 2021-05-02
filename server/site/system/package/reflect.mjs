export default {
	type$: "/system.youni.works/core",
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
	Interface: {
		type$: "Instance",
		name: "",
		type$prototype: "Object",
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
			for (let name in this.properties) {
				if (!name) break;
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
	Module: {
		type$: "Instance",
		id: "",
		version: "",
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
				target[name] = this.sys.compile(packages[name], ctxName);
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
			type$Property: "Property"
		},
		extend: function(object, decls) {
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
				if (!facet && name) this.define(object, name, value, facet);
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