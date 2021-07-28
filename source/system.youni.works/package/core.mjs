const pkg = {
	Array: {
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
				if (method.$super) return method.$super.apply(this, args);
				console.error(`super("${method.name}" ...) is not a method.`);
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