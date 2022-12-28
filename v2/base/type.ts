import { bundle, EMPTY } from "./util.js";

export interface Type {
	name: string;
	partOf?: Type;
	conf: bundle<any>;
	create(...args: unknown[]): unknown;
}

export class BaseType implements Type {
	constructor(context: TypeContext) {
		this.context = context;
		this.conf = EMPTY.object;
	}
	readonly context: TypeContext;
	conf: bundle<any>;
	declare partOf: Type;

	get name() {
		return this.conf?.name;
	}
	
	start(conf: bundle<any>) {
	}
	create() {
		return Object.create(null);
	}
}

export interface TypeContext {
	forName(name: string): Type
}

interface TypeConf {
	name: string;
	type: string;
	class: typeof BaseType;
}

export class BaseContext implements TypeContext {
	constructor(context: TypeContext, source: bundle<string | object>, types?: bundle<BaseType>) {
		this.#context = context || this;
		this.#sourceTypes = source;
		this.#types = types || Object.create(null);
	}
	#context: TypeContext;
	#types: bundle<BaseType>;
	#sourceTypes: bundle<string | object>;
	forName(name: string): BaseType {
		let type = this.#types[name];
		if (!type && this.#sourceTypes[name]) {
			let source = this.#sourceTypes[name] as TypeConf;
			if (typeof source == "string") return this.forName(source);
			source.name = name;
			if (!source.type) {
				if (!source.class) throw new Error(`Type "${name}" has no type or class property.`);
				type = new source.class(this.#context);
			} else {
				type = this.forName(source.type);
				if (!type) throw new Error(`Type "${source.type}" not found loading: ${JSON.stringify(source)}`);
				type = Object.create(type);
			}
			this.#types[name] = type;
			type.start(source as any);
		}
		return type;
	}
}
// interface TypeConf {
// 	name: string;
// 	type: string;
// 	class: typeof BaseType;
// }

// export class Loader {
// 	constructor(types: bundle<BaseType>, source: bundle<TypeConf>) {
// 		this.#types = types;
// 		this.#source = source;
// 	}
// 	#source: bundle<TypeConf>;
// 	#types: bundle<BaseType>;

// 	get(name: string): BaseType {
// 		let type = this.#types[name];
// 		if (!type && this.#source[name]) {
// 			let source = this.#source[name];
// 			if (typeof source == "string") return this.get(source);
// 			source.name = name;
// 			if (Object.hasOwn(source, "class")) type = new source.class(owner);
// 			type = this.get(source.type);
// 			if (!type) throw new Error(`Type "${source.type}" not found loading: ${JSON.stringify(source)}`);
// 			type = Object.create(type);
// 			this.#types[name] = type;
// 			type.start(source, this);
// 		}
// 		return type;
// 	}
// }

// export function start(owner: TypeContext, baseTypes: bundle<any>, source: bundle<any>) {
// 	let base = Object.create(null);
// 	for (let name in baseTypes) {
// 		let conf = baseTypes[name];
// 		conf.name = name;
// 		let type = new conf.class(owner);
// 		base[name] = type;
// 	}
// 	let loader = new Loader(base, EMPTY.object);
// 	for (let name in base) {
// 		base[name].start(baseTypes[name], loader);
// 	}
// 	loader = new Loader(base as bundle<BaseType>, source);
// 	owner.types = Object.create(null);
// 	for (let name in source) {
// 		owner.types[name] = loader.get(name);
// 	}
// 	console.log(owner.types);
// }
