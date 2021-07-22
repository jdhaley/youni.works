//facet$name - protected
//facet_name - public

export default {
			const: function(decl) {
				decl.configurable = true;
				decl.enumerable = true;
				decl.value = decl.expr;
				decl.define = function(object) {
					return Reflect.defineProperty(object, this.name, this);
				}
				return decl;
			},
			var: function(decl) {
				decl.configurable = true;
				decl.enumerable = true;
				decl.get = function getVar() {
					return decl.expr;
				}
				decl.set = function setVar(value) {
					Reflect.defineProperty(this, decl.name, {
						configurable: true,
						enumerable: true,
						writable: true,
						value: value
					});
				}
				decl.define = function(object) {
					return Reflect.defineProperty(object, this.name, this);
				}
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
				decl.define = function(object) {
					return Reflect.defineProperty(object, this.name, this);
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
				decl.define = function(object) {
					return Reflect.defineProperty(object, this.name, this);
				}
				return decl;
			},
			once: function(decl) {
				decl.configurable = true;
				const source = decl.expr;
				if (typeof source != "function") {
					console.error("once facet requires a function. Creating a value property instead.");
				}
				decl.set = function setOnce(value) {
					Reflect.defineProperty(this, decl.name, {
						configurable: true,
						enumerable: true,
						writable: true,
						value: value
					});
				}
				decl.get = function getOnce() {
					//sys2 rollout 
					if (this[Symbol.status]) {
						console.error("once$ called during compile.");
						return;
					}
					let value = source.call(this);
					decl.set.call(this, value);
					return value;
				};
				decl.define = function(object) {
					return Reflect.defineProperty(object, this.name, this);
				}
				return decl;
			},
			type: function(decl) {
				if (typeof decl.expr != "string") {
					throw new Error("type facet requires a string.");
				}
				let sys = this;
				decl.configurable = true;
				decl.enumerable = true;
				decl.get = function getType() {
					try {
						return sys.forName(decl.expr)
					}	
					catch (error) {
						//TODO add back:decl.pathname 
						throw new Error(`In ${decl.name}: ${error.message}`);
					}
				}
				decl.define = function(object) {
					return Reflect.defineProperty(object, this.name, this);
				}
				return decl;
			},
			extend: function(decl) {
				if (typeof decl.expr != "object") throw new Error("extend facet requires an object or array expression.");
				let  sys = this;
				decl.define = function(object) {
					let ext = Object.create(object[decl.name] || null);
					if (decl.expr[Symbol.iterator]) {
						for (let value of decl.expr) {
							if (value && value.name) {
								ext[value.name] = value;
							}
							else {
								console.warn("Array extend element does not contain a name property. Igonoring.");
							}
						}
					}
					for (let name in decl.expr) {
						ext[name] = decl.expr[name];
					}
					return sys.define(object, decl.name, ext, "const");
				}
				return decl;
			},
			symbol: function(decl) {
				decl.symbol = this.symbolOf(decl.name);
				if (!decl.symbol) throw new Error(`Symbol "${decl.name}" is not defined.`);
				decl.configurable = true;
				decl.value = decl.expr;
				decl.define = function(object) {
					delete object[this.name];
					return Reflect.defineProperty(object, this.symbol, this);
				}
				return decl;
			}
}