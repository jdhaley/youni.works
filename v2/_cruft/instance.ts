import { bundle } from "../base/util";

export type facet = (decl: X) => Decl;
export type fn = (args: any) => unknown;

export interface X {
	name: string;
	expr: unknown;
}
export interface Decl extends X {
	configurable: boolean;
	enumerable: boolean;

	value?: unknown;
	get?: fn;
	set?: fn;

	symbol: Symbol;

	define(object: object): boolean;
}

interface Type {
	start(conf: bundle<any>, factory: Factory): void;
}

interface Conf {
	name: string;
	type: string;
}

export class Factory  {
	#facets: bundle<facet>;
	#source: bundle<Conf>;
	#types: bundle<Type>;
	#prototype: object;
	get(name: string): Type {
		let type = this.#types[name];
		if (!type && this.#source[name]) {
			let source = this.#source[name];
			if (typeof source == "string") return this.get(source);
			source.name = name;
			type = this.get(source.type);
			if (!type) throw new Error(`Type "${source.type}" not found loading: ${JSON.stringify(source)}`);
			type = Object.create(type);
			this.#types[name] = type;
			type.start(source, this);
		}
		return type;
	}

	merge(...args: (string | object)[]) {
		let decls = Object.create(null);
		for (let arg of args) {
			if (typeof arg == "string") arg = this.#source[arg];
			for (let name in arg as object) {
				decls[name] = arg[name];
			}
		}
	}
	instance(decls: object) {
		let target = Object.create(this.#prototype);
		for (let property in decls) {
			let value = decls[property];
			let index = property.indexOf("$");
			let facet = "";
			if (index) facet = property.substring(0, index);
			property = property.substring(index + 1);
			this.define(target, facet, property, value);
		}
	}
	define(target: object, facet: string, property: string, value: unknown) {
		let ffn = this.#facets[facet];
		let decl = ffn({
			name: property,
			expr: value
		});
		decl.define(target);
	}
}
