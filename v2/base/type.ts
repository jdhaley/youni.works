import { Actions } from "./controller.js";
import { unit } from "./model.js";
import { bundle, EMPTY, extend, Sequence } from "./util.js";

export interface Type<T> {
	name: string;
	partOf?: Type<T>;
	types: bundle<Type<T>>;

	create(...args: any[]): T;
}

export interface TypeOwner {
	conf: bundle<any>;
	types: bundle<Type<unknown>>;
	unknownType: Type<unknown>;
}

export function start(owner: TypeOwner) {
	let base = loadBaseTypes(owner, owner.conf.baseTypes);
	owner.types = loadTypes(owner.conf.viewTypes, base);
	owner.unknownType = owner.types[owner.conf.unknownType];
	console.info("Types:", owner.types, "uknown type:", owner.unknownType);
}
export interface TypeConf {
	type?: string;
	extends?: TypeConf;

	kind?: string;
	props?: bundle<any>; //props?: bundle<any>
	header?: TypeConf;
	footer?: TypeConf;
	actions?: Actions;
	style?: bundle<any>;

	types?: bundle<TypeConf>;
	content?: unit | Sequence<TypeConf> | bundle<TypeConf> | ((conf: bundle<any>) => string);

	prototype?: any;
}

type types = bundle<Type<unknown>>;
//type source = bundle<TypeConf> | string;

export class BaseType<T> implements Type<T> {
	declare partOf: BaseType<T>;
	declare types: bundle<Type<T>>;
	declare name: string;
	declare conf: bundle<any>;

	generalizes(type: Type<T>): boolean {
		return type == this;
	}
	start(name: string, conf: bundle<any>): void {
	}
	create(...args: any[]): T {
		return undefined;
	}
}

function loadBaseTypes(owner: TypeOwner, baseTypes: bundle<any>): bundle<Type<unknown>> {
	let types = Object.create(null);
	for (let name in baseTypes) {
		let conf = baseTypes[name];
		let type = new conf.class(owner) as BaseType<unknown>;
		types[name] = type;
		type.start(name, conf);
	}
	return types;
}

function loadTypes(source: bundle<TypeConf>, base: types): types {
	base = Object.create(base);
	let types = Object.create(null);
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
	type.start(name, conf)

	if (name) {
		type.name = name;
		types[name] = type;
	}
	for (let name in conf.types) {
		type.types[name] = getMember(type, name, conf.types[name]);
	}
	return type;

	function getMember(owner: Type<unknown>, name: string, part: TypeConf) {
		let member: Type<unknown>;
		if (typeof part == "object") {
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