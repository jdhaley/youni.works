const pkg = {
    util: {
        isUpperCase(str) {
			return str == str.toUpperCase() && str != str.toLowerCase();
		},
        /**
         * Given the value argument, call method on the value's content or
         * the value itself when not an object.
         * @param value 
         * @param method 
         * @param methodObject The "this" argument. Can be unspecified when attached to an interface.
         */
        forEach(value, method, methodObject) {
            if (!methodObject) methodObject = this;
            if (value && value[Symbol.iterator]) {
                let i = 0;
                for (let datum of value) {
                    method.call(methodObject, datum, i++, value);
                }
            } else if (typeof value == "object") {
                for (let name in value) {
                    method.call(methodObject, value[name], name, value);
                }
            }
            // } else {
            //     method.call(methodObject, value, "", value);
            // }
        }
    },
    Iterable: {
		symbol$iterator: function *() {
		}
	},
	Array: {
        type$: "Iterable",
		var$length: 0,
		symbol$iterator: function *() {
			for (let i = 0; i < this.length; i++) yield this[i];
		}
	},
    Object: {
		valueOf() {
            return this;
        },
        toString() {
            return Object.prototype.toString.call(this);
        },
        isPrototypeOf(value) {
            //if (arguments.length == 1 && value === undefined || value === null) return false;
            return Object.prototype.isPrototypeOf.call(this, value);
        },
        hasOwnProperty(key) {
            return Object.prototype.hasOwnProperty.call(this, key);
        }
        // constructor: ƒ Object()
        // propertyIsEnumerable: ƒ propertyIsEnumerable()
        // toLocaleString: ƒ toLocaleString()
    },
    Instance: {
        let: function(name, value, facet) {
			this[Symbol.for("owner")].define(this, name, value, facet);
		},
        super: function(method, ...args) {
			if (method && typeof method == "function") {
                // if (!method.$super) {
                //     for (let object = this; object ; object = Object.getPrototypeOf(object)) {
                //         if (object[method.name] != method) {
                //             console.log(object[Symbol.toStringTag], method.name);
                //             break;
                //         }
                //     }
                // }
				if (method.$super) return method.$super.apply(this, args);
                /*It no longer considered an error if there is no super... */
				//console.error(`super("${method.name}" ...) is not a method.`);
				return;
			}
			throw new TypeError("Invalid method argument.");
		},
        perform: function(name, ...args) {
			let method = this[Symbol.for("owner")].forName(name);
			return method.apply(this, args);
        },
        extend() {
            let inst = this[Symbol.for("owner")].create(this);
            inst.implement.apply(inst, arguments);
            return inst;
        },
        implement() {
            let owner = this[Symbol.for("owner")];
            for (let i = 0; i < arguments.length; i++) owner.extend(this, arguments[i]);
        }
    },
    Component: {
        forName(name) {
            return this[Symbol.for("owner")].forName(name);
        },
        create(from) {
            return this[Symbol.for("owner")].create(from);
        },
        extend(object, extension) {
            return this[Symbol.for("owner")].extend(object, extension);
        },
        define(object, name, value, facet) {
            return this[Symbol.for("owner")].define(object, name, value, facet);
        }
    }
}
export default pkg;