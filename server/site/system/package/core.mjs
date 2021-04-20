export default {
	Object: {
		symbol$sys: null				//sys is initialized during bootstrap
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
			return this[Symbol.sys];	//Symbol.sys - initialized by bootstrap
		},
		toString: function() {
			return Object.prototype.toString.call(this);
		}
	},
	System: {
		type$: "Instance",
		extend: function(object, decls) {
			return null;
		},
		implement: function(object, decls) {
		},
		define: function(object, name, value, facetName) {
		},
		forName: function(name, component) {
			return null;
		}
	}
}