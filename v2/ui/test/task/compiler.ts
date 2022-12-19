// import { Descriptor } from "./facets";

// type Mixin = bundle<Descriptor>;

// interface bundle<T> {
// 	[key: string | symbol]: T
// }
// interface Source {
// 	type$?: string;
// 	[key: string]: unknown;
// }

// class Compiler {
// 	#source: bundle<Source | string>;
// 	#target: bundle<Mixin>;

// 	compile(source: bundle<Source>): bundle<Mixin> {
// 		let compiler: Compiler = Object.create(this);
// 		compiler.#source = source;
// 		compiler.#target = Object.create(null);
	
// 		for (let decl in source) {
// 			let name = decl.substring(0, decl.indexOf("$"));
// 			let object = Object.create(null);
// 			object._status_ = "NEW";
// 			compiler.#target[name] = object
// 		}
// 		let target = Object.create(null);
// 		for (let decl in source) {
// 			let prop = decl.substring(0, decl.indexOf("$"));
// 			target[prop] = compiler.get(prop)
// 		}
// 		return target;
// 	}

// 	get(name: string): Mixin {
// 		let mixin = this.#target[name] as any;
// 		if (!mixin) throw new Error(`get("${name}"): not found`)
// 		if (mixin._status_ == "COMPILING") throw new Error(`get("${name}"): circular reference`)
// 		if (mixin._status_ == "NEW") {
// 			mixin["status"] = "COMPILING";
// 			let source = this.#source[name];
// 			if (typeof source == "string") {
// 				if (source == name) throw new Error(`get("${name}"): self-reference`)
// 				return this.get(source);
// 			}
// 			source.name = name;
// 			mixin = Object.create(null);
// 			this.#target[name] = mixin;
// 			if (source.type$) try {
// 				this.#implement(mixin, source.type$);
// 			} catch (e) {
// 				throw new Error(`get("${name}"): ${e.message}`)
// 			}
// 			delete mixin._status_;
// 		}
// 		return mixin;
// 	}

// 	#implement(target: Mixin, typeNames: string) {
// 		let types = typeNames.split(" ");
// 		for (let i = types.length; i; i--) {
// 			let typeName = types[i - 1];
// 			if (typeName) { //handle multiple spaces
// 				try {
// 					let mixin = this.get(typeName);
// 					for (let key in mixin) target[key] = mixin[key];
// 				} catch (e) {	
// 					throw new Error(`implement("${typeNames}"): on "${typeName}": ${e.messasge}`);
// 				}
// 			}
// 		}
// 	}
// }
