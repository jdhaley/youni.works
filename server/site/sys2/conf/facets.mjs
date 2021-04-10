//facet$name - protected
//facet_name - public

export default {
	const:{
		process: function(decl) {
			decl.configurable = true;
			decl.enumerable = true;
			decl.value = decl.expr;
			return decl;
		},
		compile: function() {
			this.enumerable = false;
			this.value = compileValue(this);
		}
	},
//	default: {
//		declare: function(name, source) {
//			return Object.freeze(this.sys.extend(this, {
//				name: name,
//				source: source
//			}));
//		},
//		define: function(object) {
//			object[this.name] = this.source;
//		}
//	},
	get: {
		process: function(decl) {
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
		compile: function() {
			if (typeof this.source == "function") {
				this.get = source;
			} else {
				console.warn("get facet does not specify a function");
				this.value = source;
			}	
		}
	},
	virtual: {
		process: function(decl) {
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
		compile: function() {
			if (typeof this.source == "function") {
				this.get = source;
				this.set = source;
			} else {
				console.warn("virtual facet does not specify a function");
				this.value = source;
			}	
		}
	},
	var: {
		process: function(decl) {
			decl.configurable = true;
			decl.enumerable = true;
			decl.writable = true;
			decl.value = decl.expr;				
			return decl;
		},	
		compile: function() {
			this.writable = true;
			this.value = compileValue(this);
//			decl.get = function getVar() {
//				return source;
//			};
//			decl.set = function setVar(value) {
//				Reflect.defineProperty(this, name, {
//					configurable: true,
//					enumerable: true,
//					writable: true,
//					value: value
//				});
//			};
		}
	},
	once: {
		process: function(decl) {
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
				let value = source.call(this);
				decl.set.call(this, value);
				return value;
			};
			return decl;
		},
		compile: function() {
			const source = this.source;
			if (typeof source != "function") throw new Error("once facet requires a function.");
			this.set = function setOnce(value) {
				Reflect.defineProperty(this, name, {
					configurable: true,
					enumerable: true,
					writable: true,
					value: source
				});
			}
			this.get = function getOnce() {
				let value = source.call(this);
				this.set.call(this, value);
				return value;
			};
			return Object.freeze(this);
		}
	},
	type: {
		process: function(decl) {
			if (typeof decl.expr != "string") throw new Error("type facet requires a string.");
			decl.value = this.sys.forName(decl.expr);
			return decl;
		},
		compile: function() {
			if (typeof this.source != "string") throw new Error("type facet requires a string.");
			this.value = this.sys.forName(this.source);
			return Object.freeze(this);
		},
//		define: function(object) {
//			object[this.name] = this.sys.forName(this.source);
//		}
	},
	extend: {
		process: function(decl) {
			if (typeof decl.expr != "object") throw new Error("extend facet requires an object expression.");
			decl.extend = function extendValue(object) {
				return decl.sys.extend(object[decl.name] || null, decl.expr);
			}
			function define(object) {
				Reflect.defineProperty(object, decl.name, {
					configurable: true,
					enumerable: true,
					value: decl.sys.extend(object[decl.name] || null, decl.expr)
				});
			}
			decl.sys.define(decl, "define", define);
		},
		compile: function() {
			if (typeof this.source != "object") throw new Error("extend facet requires an object.");
		},
		define: function(object) {
			Reflect.defineProperty(object, this.name, {
				configurable: true,
				enumerable: true,
				value: this.sys.extend(object[this.name] || null, this.expr)
			});			
		}
	},
};

//	package: function(prop, target) {
//	prop.value = this.sys.packages[target];
//},

function create(facet, name, source) {
	return facet.sys.extend(facet, {
		configurable: true,
		enumerable: true,
		name: name,
		source: source
	});
}

