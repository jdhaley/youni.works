export default {
	Object: {
		type$: "",
		symbol$sys: null //sys is defined through bootstrapping.
	},
	Parcel: {
		type$: "Object"
	},
	Record: {
		type$: "Object"
	},
	Array: {
		type$: "Object",
		var$length: 0,
		symbol$iterator: function *() {
			for (let i = 0; i < this.length; i++) yield this[i];
		}
	},
	Instance: {
		type$: "Object",
		get$sys: function() {
			return this[Symbol.sys]; //Symbol.sys is defined through bootstrapping.
		},
		get$interface: function() {
			return this[this.sys.symbols.interface];
		},
		let: function(name, value, facet) {
			this.sys.define(this, name, value, facet);
		},
		super: function(method, ...args) {
			if (method && typeof method == "function") {
				if (method.$super) return method.$super.apply(this, args);
				console.error(`super("${method.name}" ...) is not a method.`);
				return;
			}
			throw new TypeError("Invalid method argument.");
		},
		toString: Object.prototype.toString,
		valueOf: Object.prototype.valueOf,
	}
}