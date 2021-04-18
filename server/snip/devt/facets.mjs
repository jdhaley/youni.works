export default {
	default: function(prop, target) {
		prop.configurable = true;
		prop.enumerable = true;
		prop.writable = true;
		prop.value = target;
	},
	const: function(prop, target) {
		prop.value = target;
	},
	method: function(prop, target) {
		prop.value = this.compileFunction(target);
	},
	get: function(prop, target) {
		prop.get = this.compileFunction(target)
	},
	virtual: function(prop, target) {
		/*
		 * The same function must perform both get (arguments.length == 0) and set (arguments.length == 1).
		 */
		prop.get = this.compileFunction(target);
		prop.set = prop.get;
	},
	var: function(prop, target) {
		/*
		 * 	var allows an object to defer defining a writable data property.
		 *  The var starts as a virtual and the first assignment will:
		 *  - replace the virtual property when this = defining object.
		 *  - define the property when this is an instance of the defining object.
		 *  It is used to overcome limitations of a JavaScript data descriptor.
		 */
		
		prop.get = function varGet() {
			return target;
		};
		prop.set = function varSet(value) {
			Reflect.defineProperty(this, prop.name, {
				configurable: true,
				enumerable: true,
				writable: true,
				value: value
			});
		}
	},
	once: function(prop, target) {
		/*
		 * once is a virtual that is executed once. The property is re-defined from the return value.
		 * Use for lazy initialization.
		 */
		let fn = this.compileFunction(target);
		
		prop.get = function onceGet() {
			let value = fn.call(this);
			prop.set.call(this, value);
			return value;
		}
		prop.set = function varSet(value) {
			Reflect.defineProperty(this, prop.name, {
				configurable: true,
				enumerable: true,
				writable: true,
				value: value
			});
		}
	},
	type: function(prop, target) {
		prop.configurable = true;
		prop.enumerable = true;
		prop.writable = true;
		prop.value = this.forName(prop.source);
	},
	package: function(prop, target) {
		prop.value = this.sys.packages[target];
	},
	extend: function extendProperty(prop) {
		function define(object) {
			this.target = object[this.name] || null;
			this.value = this.sys.extend(this.target, this.source);
			Reflect.defineProperty(object, this.name, this);
		}
		this.sys.define(prop, "define", define);
	},
	after: function(prop, target) {
		target = this.compileFunction(target);
		let sys = this.sys;
		function define(object) {
			if (!sys.isInterface(object)) {
				sys.log.warn(`Facet "after ${this.name}" defined on non-interface"`);			
			}
			let before = object[this.name];
			if (typeof before != "function") before = () => before;
			
			this.value = function afterChain() {
				Function.returned = before.apply(this, arguments);
				let ret = target.apply(this, arguments);
				delete Function.returned;
				return ret;
			}
			return Reflect.defineProperty(object, this.name, this);
		}
		this.sys.define(prop, "define", define);
	},
	before: function(prop, target) {
		target = this.compileFunction(target);
		let sys = this.sys;
		function define(object) {
			if (!sys.isInterface(object)) {
				sys.log.warn(`Facet "after ${this.name}" defined on non-interface"`);			
			}
			let after = object[this.name];
			if (typeof after != "function") after = () => after;
			
			this.value = function beforeChain() {
				target.apply(this, arguments);
				return after.apply(this, arguments);
			}
			return Reflect.defineProperty(object, this.name, this);
		}
		this.sys.define(prop, "define", define);
	}
};
