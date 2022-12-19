//facet$name - protected
//facet_name - public

export type facet = (name: string, expr: unknown) => Descriptor;
export type fn = (args: any) => unknown;

interface Declaration {
	name: string;
	expr: unknown;
}

export class Descriptor implements Declaration {
	constructor(name: string, expr: unknown) {
		this.name = name;
		this.expr = expr;
	}
	name: string;
	expr: unknown;

	configurable: boolean;
	enumerable: boolean;
	declare writable?: boolean;
	declare value?: unknown;
	declare get?: fn;
	declare set?: fn;

	symbol?: Symbol;

	define(object: object): boolean {
		return undefined;
	}
}
//type Mixin = bundle<Descriptor>;

interface bundle<T> {
	[key: string | symbol]: T
}

export const base: bundle<facet> = {
	var(name: string, expr: unknown) {
		let desc = new Descriptor(name, expr);
		desc.configurable = true;
		desc.enumerable = true;
		desc.writable = true;
		desc.value = desc.expr;
		desc.define = function(object) {
			return Reflect.defineProperty(object, this.name, this);
		}
		return desc;
	},
	const(name: string, expr: unknown) {
		let desc = new Descriptor(name, expr);
		desc.configurable = true;
		desc.enumerable = true;
		desc.value = desc.expr;
		desc.define = function(object) {
			return Reflect.defineProperty(object, this.name, this);
		}
		return desc;
	},
	require(name: string, expr: unknown) {
		let desc = new Descriptor(name, expr);
		desc.define = function(object: object) {
			//implement something like this:
			// if (!object[desc.name]) {
			// 	console.warn("Require missing " + desc.name);
			// }
			return true;
		}
		return desc;
	},
	//supports re-definition of a property via a "set once" mechanism. May be required for more complex types.
	oncevar(name: string, expr: unknown) {
		let desc = new Descriptor(name, expr);
		desc.configurable = true;
		desc.enumerable = true;
		desc.get = function getVar() {
			return desc.expr;
		}
		desc.set = function setVar(value) {
			Reflect.defineProperty(this, desc.name, {
				configurable: true,
				enumerable: true,
				writable: true,
				value: value
			});
		}
		desc.define = function(object) {
			return Reflect.defineProperty(object, this.name, this);
		}
		return desc;
	},
	get(name: string, expr: unknown) {
		let desc = new Descriptor(name, expr);
		desc.configurable = true;
		desc.enumerable = true;
		if (typeof desc.expr == "function") {
			desc.get = desc.expr as () => unknown;				
		} else {
			console.warn("get facet requires a function. Creating a value property instead.");
			desc.value = desc.expr;
		}
		desc.define = function(object) {
			return Reflect.defineProperty(object, this.name, this);
		}
		return desc;
	},
	virtual(name: string, expr: unknown) {
		let desc = new Descriptor(name, expr);
		desc.configurable = true;
		desc.enumerable = true;
		if (typeof desc.expr == "function") {
			desc.get = desc.expr as fn;
			desc.set = desc.expr as fn;
		} else {
			console.warn("virtual facet requires a function. Creating a value property instead.");
			desc.value = desc.expr;
		}
		desc.define = function(object) {
			return Reflect.defineProperty(object, this.name, this);
		}
		return desc;
	},
	once(name: string, expr: unknown) {
		let desc = new Descriptor(name, expr);
		desc.configurable = true;
		const source = desc.expr as fn;
		if (typeof source != "function") {
			console.error("once facet requires a function. Creating a value property instead.");
		}
		desc.set = function setOnce(value) {
			Reflect.defineProperty(this, desc.name, {
				configurable: true,
				enumerable: true,
				writable: true,
				value: value
			});
		}
		desc.get = function getOnce() {
			//sys2 rollout 
			if (this[Symbol["status"]]) {
				console.error("once$ called during compile.");
				return;
			}
			let value = source.call(this);
			desc.set.call(this, value);
			return value;
		};
		desc.define = function(object) {
			return Reflect.defineProperty(object, this.name, this);
		}
		return desc;
	},
	type(name: string, expr: unknown) {
		let desc = new Descriptor(name, expr);
		if (typeof desc.expr != "string") {
			throw new Error("type facet requires a string.");
		}
		let sys = this;
		desc.configurable = true;
		desc.enumerable = true;
		desc.get = function getType() {
			try {
				return sys.forName(desc.expr)
			}	
			catch (error) {
				//TODO add back:desc.pathname 
				throw new Error(`In ${desc.name}: ${error.message}`);
			}
		}
		desc.define = function(object) {
			return Reflect.defineProperty(object, this.name, this);
		}
		return desc;
	},
	extend(name: string, expr: unknown) {
		let desc = new Descriptor(name, expr);
		if (typeof desc.expr != "object") throw new Error("extend facet requires an object or array expression.");
		let  sys = this;
		desc.define = function(object) {
			let ext = Object.create(object[desc.name] || null);
			// if (desc.expr[Symbol.iterator]) {
			// 	for (let value of desc.expr) {
			// 		if (value && value.name) {
			// 			ext[value.name] = value;
			// 		}
			// 		else {
			// 			console.warn("Array extend element does not contain a name property. Igonoring.");
			// 		}
			// 	}
			// }
			for (let name in desc.expr as object) {
				let expr = desc.expr[name];
				if (typeof expr == "function" && !expr.$super && typeof ext[name] == "function") {
					expr.$super = ext[name];
				}
				ext[name] = expr;
			}
			return sys.define(object, desc.name, ext, "const");
		}
		return desc;
	},
	symbol(name: string, expr: unknown) {
		let desc = new Descriptor(name, expr);
		desc.symbol = this.symbolOf(desc.name);
		if (!desc.symbol) throw new Error(`Symbol "${desc.name}" is not defined.`);
		desc.configurable = true;
		desc.value = desc.expr;
		desc.define = function(object) {
			delete object[this.name];
			return Reflect.defineProperty(object, this.symbol, this);
		}
		return desc;
	}
}
