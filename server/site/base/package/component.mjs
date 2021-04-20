export default {
	type$: "/system.youni.works/core",
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
		}
	}
}