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
	start(name: string, conf: bundle<any>, loader?: TypeLoader): void {
	}
	create(...args: any[]): T {
		return undefined;
	}
}

export class TypeLoader {
	constructor(ctx: TypeContext, base: bundle<TypeConf>) {
		this.target = loadBaseTypes(ctx, base);
	}
	source: bundle<TypeConf | string>;
	target: bundle<Type<unknown>>;

	ctx: TypeContext;

	loadTypes(source: bundle<TypeConf>): void {
		this.source = source;
		for (let name in source) {
			this.ctx.types[name] = this.getType(name);
		}
	}
	getType(name: string): Type<unknown> {
		let type = this.target[name];
		if (!type && this.source[name]) {
			let value = this.source[name];
			if (typeof value == "object") {
				type = this.getType(value.type);
				if (!type) throw new Error(`Supertype "${value.type}" not found while loading "${name}"`);
				type = Object.create(type);
				(type as BaseType<unknown>).start(name, value, this);
				this.target[name] = type;
			} else {
				type = this.getType(value);
			}
		}
		if (!type) throw new Error(`Type "${name}" not found.`);
		return type;
	}
	protected ____createType(name: string, conf: TypeConf) {
		let supertype = conf.type ? this.getType(conf.type) : null;
		let type = Object.create(supertype) as BaseType<unknown>;
		// type.types = Object.create(supertype.types || null);
	
		// if (name) {
		// 	conf["name"] = name;
		// 	type.name = name;
		// 	this.target[name] = type;
		// }
		// for (let name in conf.types) {
		// 	type.types[name] = getMember(type, name, conf.types[name]);
		// }
	
		type.start(name, conf, this);
		return type;
	
		function getMember(owner: Type<unknown>, name: string, part: TypeConf | string) {
			let member: Type<unknown>;
			if (typeof part == "object") {
				part["name"] = name;
				member = this.createType("", part);
			} else {
				member = this.getType(part);
				member = Object.create(member);
			}
			member.name = name;
			member.partOf = owner;
			return member;
		}
	}
}
function loadBaseTypes(owner: TypeContext, baseTypes: bundle<TypeConf>): bundle<Type<unknown>> {
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
