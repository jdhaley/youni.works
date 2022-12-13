// import { bundle } from "./util";

// export class Factory  {
// 	#source: bundle<object>;
// 	#types: bundle<object>;
// 	#prototype: object;
// 	get(name: string): object {
// 		let type = this.#types[name];
// 		if (!type && this.#source[name]) {
// 			let source = this.#source[name];
// 			if (typeof source == "string") return this.get(source);
// 			source.name = name;
// 			type = this.get(source.type);
// 			if (!type) throw new Error(`Type "${source.type}" not found loading: ${JSON.stringify(source)}`);
// 			type = Object.create(type);
// 			this.#types[name] = type;
// 			type.start(source, this);
// 		}
// 		return type;
// 	}

// 	merge(...args: (string | object)[]) {
// 		let decls = Object.create(null);
// 		for (let arg of args) {
// 			if (typeof arg == "string") arg = this.#source[arg];
// 			for (let name in arg as object) {
// 				decls[name] = arg[name];
// 			}
// 		}
// 	}
// 	instance(decls: object) {
// 		let target = Object.create(this.#prototype);
// 		for (let property in decls) {
// 			let value = decls[property];
// 			let index = property.indexOf("$");
// 			let facet = "";
// 			if (index) facet = property.substring(0, index);
// 			property = property.substring(index + 1);
// 			this.define(target, facet, property, value);
// 		}
// 	}
// 	define(target: object, facet: string, property: string, value: unknown) {
// 		Reflect.defineProperty(target, property, {
// 			value: value
// 		});
// 	}
// }
