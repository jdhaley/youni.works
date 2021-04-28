const OBJECT = Object;
const INTERFACE = Symbol("interface");

const ObjectInterface = OBJECT.create(null);
const Declaration = OBJECT.create(ObjectInterface);

Declaration.define = function(object) {
	return OBJECT.defineProperty(object, this.name, this);
}

export default {
	package$: "youni.works/base/system",
	Object: ObjectInterface,
	Declaration: Declaration,
	System: {
		super$: "Object",
		interfaceOf: function(value, match) {
			let matchType = typeof match;
			while (value) {
				value = value[INTERFACE];
				switch (matchType) {
					case "string":
						if (match == value[Symbol.toStringTag]) return value;
						break;
					case "object":
						if (match == value) return value;
						break;
					case "undefined":
						return value;
					default:
						throw new TypeError("Invalid match argument.");
				}
				value = this.prototypeOf(value);
			}
		},
		prototypeOf: function(value) {
			if (value && typeof value == "object") return OBJECT.getPrototypeOf(value);
		},
		isPrototypeOf: function(object, value) {
			return typeof object == "object" 
				? OBJECT.isPrototypeOf.call(object, value)
				: false;
		},
		isInterface: function(object) {
			return this.hasOwn(object, INTERFACE) || object === null;
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
			if (!object.sys) OBJECT.defineProperty(object, "sys", {value: this});
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
		forName: function(name) {
			let cls = null;
			if (name) {
				let idx = name.lastIndexOf("/");
				let pkg = this.packages[name.substring(0, idx)];
				if (pkg) cls = pkg[name.substring(idx + 1)];
				if (!cls) console.warn("Class '" + name + "' does not exist.");
			}
			return cls;			
		},
		//TODO follow the standard: package NOT packages.
		packages: {
		}
	}
}

//Object[Symbol.toPrimitive] = function(hint) {
//let value = this.valueOf(hint);
///*
// 	The primitive value is determined recursively via '+value' and '"" + value'
// 	when "value" is an object, unless "value === this" in which case we return 
// 	1 ("truth") or "". There is a small risk of an endless loop when this.valueOf()
// 	returns another object whose value cycles back to this.
// */
//if (hint == "number") return value === this ? 1 : +value;
//if (hint == "string") return value === this ? "" : "" + value;
//return value[Symbol.toStringTag];
//}
//Object.valueOf = function(type) {
//return type == "function" ? this.apply.bind(this) : this;
//}
//Object.apply = function apply() {
//let value = arguments.length ? this[arguments[0]] : this;
//if (arguments.length > 1) {
//	if (typeof value != "function") {
//		throw new TypeError(`"${arguments[0]}" is not a function.`);
//	}
//	value = value.apply(this, arguments[1]);
//}
//return value;
//}
