export default {
	package$: "youni.works/base/system",
	use: {
	},
	type$Object: "Object",
	type$Declaration: "Declaration",
	System: {
		super$: "Object",
		prototypeOf: function(value) {
			if (value && typeof value == "object") return OBJECT.getPrototypeOf(value);
		},
		interfaceOf: function(value, name) {
			while (value) {
				value = value && value[INTERFACE];
				if (!name) return value;
				if (name == value[Symbol.toStringTag]) return value;
				value = this.prototypeOf(value);
			}
		},
		isPrototypeOf: function(object, value) {
			return typeof object == "object" 
				? OBJECT.isPrototypeOf.call(object, value)
				: false;
		},
		isInterface: function(object) {
			return this.hasOwn(object, INTERFACE) || object === Object;
		},
		isDeclaration: function(value) {
			return this.isPrototypeOf(Declaration, value);
		},
		isPublic: function(object, key) {
			for (; object; object = this.prototypeOf(object)) {
				let descriptor = Reflect.getOwnPropertyDescriptor(object, key);
				if (descriptor) return descriptor.enumerable ? true : false;
			}
			return undefined;
		},
		describe: function(object, key) {
			while (object) {
				let descriptor = Reflect.getOwnPropertyDescriptor(object, key);
				if (descriptor) {
					descriptor.name = key;
					descriptor.definedOn = object;
					return this.extend(Declaration, descriptor);
				}
				object = this.prototypeOf(object);
			}
			return Declaration;
		},
		hasOwn: function(object, key) {
			return object && typeof object == "object" && OBJECT.hasOwnProperty.call(object, key);
		},
		extend: function(object, declarations) {
			if (!arguments.length) object = null;
			return this.implement(OBJECT.create(object), declarations);
		},
		implement: function(object, declarations) {
			for (let name in declarations) {
				this.define(object, name, declarations[name]);
			}
			return object;
		},
		define: function(object, name, decl) {
			if (!this.isDeclaration(decl)) {
				decl = this.declare(decl, name);
				decl.enumerable = true;
				decl.writable = true;
				decl.value = decl.source;
			}
			try {
				decl.define(object);
			} catch (error) {
				this.error(error);
			}
			return decl;
		},
		defineInterface: function(object, name) {
			if (!object.sys) object.sys = this;
			if (name) OBJECT.defineProperty(object, Symbol.toStringTag, {value: name});
			if (this.isInterface(this.prototypeOf(object))) {
				OBJECT.defineProperty(object, INTERFACE, {value: object});
			}
		},
		declare: function(source, name, facet) {
			let prop = this.extend(Declaration);
			if (name) prop.name = name;
			if (facet) prop.facet = facet;
			prop.source = source;
			return prop;
		},
		error: function(error) {
			//TODO could add a debugger statement when environment is development.
			throw error;
		},
		//TODO follow the standard: package NOT packages.
		packages: {
		}
	}
}