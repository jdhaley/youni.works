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
		length: 0,
		symbol$iterator: function *() {
			for (let i = 0; i < this.length; i++) yield this[i];
		}
	},
	Instance: {
		type$: "Object",
		get$sys: function() {
			return this[Symbol.sys]; //Symbol.sys is defined through bootstrapping.
		},
		toString: function() {
			//TODO test using Symbol.toPrimitive instead.
			return "";
		}
	}
}