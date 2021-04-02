const OBJECT = Object;
const INTERFACE = Symbol("interface");

const Nil = OBJECT.freeze(OBJECT.create(null));
const Map = OBJECT.freeze(OBJECT.create(null));
const ObjectInterface = OBJECT.create(null);
const Declaration = OBJECT.create(ObjectInterface);

Declaration.define = function(object) {
	return OBJECT.defineProperty(object, this.name, this);
}

export default {
	package$: "youni.works/base/sys",
	Declaration: {
		facet: "",
		name: "",
		source: undefined,
		declare: function(name, value) {
			return this.sys.extend(this, {
				name: name,
				source: value,
				configurable: true,
				enumerable: true,
				writable: true,
				value: value
			});
		},
		define: function(object) {
			Reflect.defineProperty(object, this.name, this);
		}
	},
	Sys: {
		facets: null,
		declare: function(name, value, facet) {
			let decl = this.facets[name || "default"];
			if (!f) {
				console.error(`Facet "${name}" does not exist.`);
				decl = this.facets.default;
			}
			return decl.declare(name, value);
		},
		define: function(object, name, value, facet) {
			let decl = this.declare(name, value, facet);
			decl.define(object);
			return decl;
		},
		implement: function(object, declarations) {
			let decls = Object.create(null);
			for (let name in declarations) {
				let decl = this.define(object, nameOf(name), declarations[name], facetOf(name));
			}
			return decls;
		},
		extend: function(object, declarations) {
			if (!arguments.length) object = null;
			return this.implement(Object.create(object), declarations);
		},
		facetOf: function(declaration) {
			if (typeof declaration == "string") {
				return declaration.indexOf("$") >= 0 ? declaration.substr(0, declaration.indexOf("$")) : "";
			}
			return "";
		},
		nameOf: function(declaration) {
			if (typeof declaration == "string") {
				if (declaration.indexOf("$") >= 0) declaration = declaration.substr(declaration.indexOf("$") + 1);
				if (declaration.startsWith("@")) declaration = this.symbol[declaration.slice(1)];
			}
			return declaration;
		}
	}
}