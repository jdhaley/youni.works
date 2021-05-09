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
			array[Symbol.status] = "Array";
			for (let i = 0; i < length; i++) {
				array[i] = this.parse(source[i], componentName + "/" + i);
			}
			if (componentName) sys.define(array, sys.symbols.name, componentName);
			return array;
		},
		parseObject: function(source, componentName) {
			const sys = this.sys;
			let object = sys.extend();
			for (let decl in source) {
				let name = sys.nameOf(decl);
				let facet = sys.facetOf(decl);
				let value = this.parse(source[decl], componentName + "/" + name);
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
	}
}