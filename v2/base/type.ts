import { bundle, EMPTY } from "./util.js";

export interface Type {
	name: string;
	partOf?: Type;
	conf: bundle<any>;
}

export class BaseType implements Type {
	constructor(context: TypeContext) {
		this.context = context;
	}
	readonly context: TypeContext;
	declare partOf: Type;
	declare conf: bundle<any>;

	get name() {
		return this.conf.name;
	}
	
	start(conf: bundle<any>, loader?: Loader) {
	}
}

export interface TypeContext {
	types: bundle<Type>;
}

interface TypeConf {
	name: string;
	type: string;
	class: typeof BaseType;
}

export class Loader {
	constructor(types: bundle<BaseType>, source: bundle<TypeConf>) {
		this.#types = types;
		this.#source = source;
	}
	#source: bundle<TypeConf>;
	#types: bundle<BaseType>;

	get(name: string): BaseType {
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
}

export function start(owner: TypeContext, baseTypes: bundle<any>, source: bundle<any>) {
	let base = Object.create(null);
	for (let name in baseTypes) {
		let conf = baseTypes[name];
		conf.name = name;
		let type = new conf.class(owner);
		base[name] = type;
	}
	let loader = new Loader(base, EMPTY.object);
	for (let name in base) {
		base[name].start(baseTypes[name], loader);
	}
//	return base;

//	let base = loadBaseTypes(owner, baseTypes, loader);
	loader = new Loader(base as bundle<BaseType>, source);
	owner.types = Object.create(null);
	for (let name in source) {
		owner.types[name] = loader.get(name);
	}
	console.log(owner.types);
}
