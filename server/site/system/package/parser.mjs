export default {
	type$: "/system.youni.works/reflect",
	Parser: {
		type$: "Instance",
		parse: function(value, componentName) {
			if (this.sys.compiler.statusOf(value)) {
				console.warn(`Possible parsing cycle detected in "${componentName}"`);
				return value;
			}
			if (value && typeof value == "object") {
				let proto = Object.getPrototypeOf(value);
				if (proto == Array.prototype) {
					value = this.parseArray(value, componentName);
				} else if (proto == Object.prototype) {
					value = this.parseObject(value, componentName);
				}
			} else if (typeof value == "function") {
				value = this.parseFunction(value, componentName);
			}
			return value;
		},
		parseFunction: function(source, componentName) {
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
		parseArray: function(source, componentName) {
			const sys = this.sys;
			let length = source.length;
			let array = sys.extend(sys.use.Array, {
				length: length
			});
			for (let i = 0; i < length; i++) {
				array[i] = this.parse(source[i], componentName + "/" + i);
			}
			array[Symbol.status] = "Array";
			if (componentName) sys.define(array, sys.symbols.name, componentName);
			return array;
		},
		parseObject: function(source, componentName) {
			const sys = this.sys;
			let object = sys.extend();
			sys.define(object, sys.symbols.name, componentName || "");
			for (let decl in source) {
				let name = sys.nameOf(decl);
				let facet = sys.facetOf(decl);
				let value = source[decl];
				this.parseProperty(object, name, value, facet);
			}
			object[Symbol.status] = object[""] ? "Instance" : "Parcel";
			return object;
		},
		parseProperty: function(object, name, value, facet) {
			const sys = this.sys;
			let componentName = name ? object[this.sys.symbols.name] + "/" + name : "";
			value = this.parse(value, componentName);
			if (facet) {
				value = this.sys.declare(facet, name, value);
				value[Symbol.status] = "Property";
			}
			if (this.sys.compiler.statusOf(value)) {
				value[this.sys.symbols.of] = object;
				if (name) value[this.sys.symbols.pn] = name;
				if (componentName) value[this.sys.symbols.name] = componentName;
			}
			object[name] = value;
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