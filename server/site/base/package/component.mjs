export default {
	type$: "/system.youni.works/core",
	A: {
		type$: "",
		x: "x"
	},
	B: {
		type$: "",
		y: "y"
	},
	Test: {
		type$: ["Instance", "A", "B"]
	},
	Component: {
		type$: "Instance",
		super: function(name, ...args) {
			const thisValue = this[name];
			for (let proto = Object.getPrototypeOf(this); proto; proto = Object.getPrototypeOf(proto)) {
				let protoValue = proto[name];
				if (protoValue !== thisValue) {
					if (typeof protoValue == "function") return protoValue.apply(this, args);
					break;
				}
			}
			throw new Error(`super "${name}" is not a method.`);
		},
		extend: function(decls) {
			return this.sys.extend(this, decls);
		},
		implement: function(decls) {
			return this.sys.implement(this, decls);
		},
		define: function(name, value, facetName) {
			return this.sys.define(this, name, value, facetName);
		},
		get$interface: function() {
			return this.sys[this.sys.symbols.interface];
		},
		instanceOf: function(object) {
			return object && typeof object == "object" && Object.prototype.isPrototypeOf.call(object, this);
		},
		toString: function() {
			//TODO test using Symbol.toPrimitive instead.
			return "";
		}
	}
}