import { Actions } from "./controller.js";
import { bundle } from "./util.js";

export interface Type {
	name: string;
	partOf?: Type;
	conf: bundle<any>;
}

export class BaseType<T> implements Type {
	constructor(context: TypeContext) {
		this.context = context;
	}
	readonly context: TypeContext;
	declare name: string;
	declare partOf: Type;
	declare conf: TypeConf;

	start(conf: TypeConf, loader?: Loader) {
	}
}

export interface TypeContext {
	types: bundle<Type>;
}

export interface TypeConf {
	name?: string;
	type?: string;
	types?: bundle<TypeConf | string>;
	class?: typeof BaseType;
	actions?: Actions;
}

export class Loader {
	constructor(types: bundle<BaseType<unknown>>, source: bundle<TypeConf>) {
		this.#types = types;
		this.#source = source;
	}
	#source: bundle<TypeConf>;
	#types: bundle<BaseType<unknown>>;

	get(name: string): BaseType<unknown> {
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
	let base = loadBaseTypes(owner, baseTypes);
	let loader = new Loader(base as bundle<BaseType<unknown>>, source);
	owner.types = Object.create(null);
	for (let name in source) {
		owner.types[name] = loader.get(name);
	}
	console.log(owner.types);
}

function loadBaseTypes(owner: TypeContext, baseTypes: bundle<TypeConf>): bundle<Type> {
	let types = Object.create(null);
	for (let name in baseTypes) {
		let conf = baseTypes[name];
		conf.name = name;
		let type = new conf.class(owner);
		types[name] = type;
		type.start(conf);
	}
	return types;
}
