import { bundle } from "../base/util.js";

export interface Type<T> {
	name: string;
	partOf?: Type<T>;
	types: bundle<Type<T>>;

	create(...args: any[]): T;
}

export interface TypeContext {
	types: bundle<Type<unknown>>;
}

export interface TypeConf {
	type?: string;
	types?: bundle<TypeConf | string>;
	class?: typeof BaseType;
	name?: string;
}

export function start(owner: TypeContext, baseTypes: bundle<any>, types: bundle<any>) {
	let base = loadBaseTypes(owner, baseTypes);
	owner.types = loadTypes(owner.types, types, base);
	console.info("Types:", owner.types);
}

type types = bundle<Type<unknown>>;

export class BaseType<T> implements Type<T> {
	constructor(context: TypeContext) {
		this.context = context;
	}
	readonly context: TypeContext;
	declare partOf: BaseType<T>;
	declare types: bundle<Type<T>>;
	declare name: string;
	declare conf: TypeConf;

	generalizes(type: Type<T>): boolean {
		return type == this;
	}
	start(name: string, conf?: bundle<any>): void {
	}
	create(...args: any[]): T {
		return undefined;
	}
	extend(conf: TypeConf, loader: Loader) {
		this.types = Object.create(this.types || null);
		for (let name in conf.types) {
			let memberConf = conf.types[name];
			let member: BaseType<unknown>;
			if (typeof memberConf == "object") {
				memberConf.name = name;
				member = loader.load(memberConf);
				member.partOf = this;
			} else {
				member = loader.get(memberConf);
				member = Object.create(member);
				member.partOf = this;
				member.start(name);
			}
			this.types[name] = member as any;
		}
		if (!conf.name) console.error("No conf name", conf);
		this.start(conf.name, conf)
	}
}
class Loader {
	constructor(types: bundle<BaseType<unknown>>, source: bundle<TypeConf>) {
		this.#types = types;
		this.#source = source;
	}
	#source: bundle<TypeConf>;
	#types: bundle<BaseType<unknown>>;

	load(value: TypeConf): BaseType<unknown> {
		console.log("loading", value.name);
		let type = this.get(value.type);
		if (type) {
			type = Object.create(type);
			this.#types[value.type] = type;
			type.extend(value, this);
		}
		console.log("loaded", value.name);
		return type;
	}
	get(name: string): BaseType<unknown> {
		let type = this.#types[name];
		if (!type && this.#source[name]) {
			this.#source[name].name = name;
			type = this.load(this.#source[name]);
			this.#types[name] = type;
		}
	//	console.log("get", name, type.name);
		return type;
	}
}

export function start2(owner: TypeContext, baseTypes: bundle<any>, source: bundle<any>) {
	let base = loadBaseTypes(owner, baseTypes);
	let loader = new Loader(base, source);
	owner.types = Object.create(null);
	for (let name in source) {
		owner.types[name] = loader.get(name);
	}
	console.log(owner.types);
}

function loadBaseTypes(owner: TypeContext, baseTypes: bundle<TypeConf>): bundle<BaseType<unknown>> {
	let types = Object.create(null);
	for (let name in baseTypes) {
		let conf = baseTypes[name];
		conf["name"] = name;
		let type = new conf.class(owner);
		types[name] = type;
		type.start(name, conf);
	}
	return types;
}

function loadTypes(types: types, source: bundle<TypeConf>, base: types): types {
	base = Object.create(base);
	for (let name in source) {
		types[name] = getType(name, base, source);
	}
	return types
}

function getType(name: string, types: types, source: bundle<TypeConf>): Type<unknown> {
	let type = types[name];
	if (!type && source[name]) {
		let value = source[name];
		if (typeof value == "object") {
			type = createType(name, value, types, source);
		} else {
			type = getType(value, types, source);
		}
	} else if (!type) {
		console.warn(`Type "${name}" is not defined.`);
		type = types.text;
	}
	types[name] = type;
	return type;
}

function createType(name: string, conf: TypeConf, types: types, source: bundle<TypeConf>) {
	let supertype = conf.type ? getType(conf.type, types, source) : null;
	let type = Object.create(supertype) as BaseType<unknown>;
	type.types = Object.create(supertype.types || null);

	if (name) {
		conf["name"] = name;
		type.name = name;
		types[name] = type;
	}
	for (let name in conf.types) {
		type.types[name] = getMember(type, name, conf.types[name]);
	}

	type.start(name, conf)
	return type;

	function getMember(owner: Type<unknown>, name: string, part: TypeConf | string) {
		let member: Type<unknown>;
		if (typeof part == "object") {
			part["name"] = name;
			member = createType("", part as any, types, source);
		} else {
			member = getType(part, types, source);
			member = Object.create(member);
		}
		member.name = name;
		member.partOf = owner;
		return member;
	}
}

