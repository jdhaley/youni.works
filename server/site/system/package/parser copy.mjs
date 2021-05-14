export default {
	type$: "/system.youni.works/reflect",
	Parser: {
		type$: "Instance",
		parse: function(value) {
			if (this.sys.compiler.statusOf(value)) {
				console.warn(`Possible parsing cycle detected in "${this.pathName(value)}"`);
				return value;
			}
			if (value && typeof value == "object") {
				let proto = Object.getPrototypeOf(value);
				if (proto == Array.prototype) {
					value = this.parseArray(value);
				} else if (proto == Object.prototype) {
					value = this.parseObject(value);
				}
			} else if (typeof value == "function") {
				value = this.parseFunction(value);
			}
			return value;
		},
		parseFunction: function(source) {
			if (source.name == "expr$") {
				source[Symbol.status] = "Expr";
			} else {
				if (!Object.isFrozen(source)) {
					source[Symbol.status] = "Method";
				}	
			}
			return source;
		},
		parseArray: function(source) {
			const sys = this.sys;
			let length = source.length;
			let array = sys.extend(sys.use.Array, {
				length: length
			});
			for (let i = 0; i < length; i++) {
				array[i] = this.parse(source[i]);
			}
			array[Symbol.status] = "Array";
			return array;
		},
		parseObject: function(source) {
			const sys = this.sys;
			let object = sys.extend();
			for (let decl in source) {
				let name = sys.nameOf(decl);
				let facet = sys.facetOf(decl);
				this.parseProperty(source, name, facet);
			}
			object[Symbol.status] = object[""] ? "Instance" : "Parcel";
			let cn = source[this.sys.symbols.name];
			if (cn) object[this.sys.symbols.name] = cn;
			return object;
		},
		parseProperty: function(object, name, facet) {
			let value = this.parse(object[name]);
			if (facet) {
				value = this.sys.declare(facet, name, value);
				value[Symbol.status] = "Property";
			}
			object[name] = value;
			if (this.sys.compiler.statusOf(value)) {
				value[this.sys.symbols.of] = object;
				value[this.sys.symbols.pn] = name;
				value[this.sys.symbols.name] = object[this.sys.symbols.name] + "/" + name;
			}
		},
		pathName: function(value) {
			if (this.sys.statusOf(value)) {
				let of = value[this.sys.symbols.of];
				let name = value[this.sys.symbols.pn];				
				return of ? this.pathName(of) + "/" + name : name;
			}
			return "";
		}
	}
}