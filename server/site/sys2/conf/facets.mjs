//facet$name - protected
//facet_name - public

export default {
	const:function(decl) {
		decl.configurable = true;
		decl.enumerable = true;
		decl.value = decl.expr;
		return decl;
	},
	get: function(decl) {
		decl.configurable = true;
		decl.enumerable = true;
		if (typeof decl.expr == "function") {
			decl.get = decl.expr;				
		} else {
			console.warn("get facet requires a function. Creating a value property instead.");
			decl.value = decl.expr;
		}
		return decl;
	},
	virtual: function(decl) {
		decl.configurable = true;
		decl.enumerable = true;
		if (typeof decl.expr == "function") {
			decl.get = decl.expr;
			decl.set = decl.expr;
		} else {
			console.warn("virtual facet requires a function. Creating a value property instead.");
			decl.value = decl.expr;
		}
		return decl;
	},
	var: function(decl) {
		decl.configurable = true;
		decl.enumerable = true;
		decl.writable = true;
		decl.value = decl.expr;				
		return decl;
	},
//			decl.get = function getVar() {
//				return source;
//			}
//			decl.set = function setVar(value) {
//				Reflect.defineProperty(this, name, {
//					configurable: true,
//					enumerable: true,
//					writable: true,
//					value: value
//				});
//			}
	once: function(decl) {
		const source = decl.expr;
		if (typeof source != "function") {
			console.error("once facet requires a function. Creating a value property instead.");
		}
		decl.set = function setOnce(value) {
			Reflect.defineProperty(this, name, {
				configurable: true,
				enumerable: true,
				writable: true,
				value: value
			});
		}
		decl.get = function getOnce() {
			//sys2 rollout 
			if (this[this.sys.symbols.compile]) {
				console.error("once$ called during compile.");
				return;
			}
			let value = source.call(this);
			decl.set.call(this, value);
			return value;
		};
		return decl;
	},
	type: function(decl) {
		if (typeof decl.expr != "string") throw new Error("type facet requires a string.");
		decl.value = decl.sys.forName(decl.expr);
		return decl;
	},
	extend: function(decl) {
		if (typeof decl.expr != "object") throw new Error("extend facet requires an object expression.");
		decl.configurable = true;
		decl.enumerable = true;
		decl.get = function() {
			let value = Object.getPrototypeOf(this)[decl.name];
			value = decl.sys.extend(value || null, decl.expr);
			Reflect.defineProperty(this, decl.name, {
				configurable: true,
				enumerable: true,
				value: value
			});
			return value;
		}
		return decl;
	},
	symbol: function(decl) {
		let symbol = decl.sys.symbols[decl.name];
		if (!symbol) throw new Error("symbol is not defined.");
		decl.name = symbol;
		decl.value = decl.expr;
		return decl;
	}
};
