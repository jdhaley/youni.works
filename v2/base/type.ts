import { Actions } from "./controller.js";
import { bundle, EMPTY, extend } from "./util.js";

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
/*
export interface Display {
	kind?: string | string[];
	options?: string | string[];
	props?: bundle<any>;
	header?: Display;
	content: (conf: bundle<any>) => string | Box | Sequence<Display> | bundle<Display> | string | number | boolean | null;
	footer?: Display;
	actions?: Actions;
}
*/
interface TypeConf {
	type: string;
	kind?: string | string[]
	props: bundle<any>; //props?: bundle<any>
	header?: TypeConf;
	//content: (conf: bundle<any>) => string | Box | Sequence<Display> | bundle<Display> | string | number | boolean | null;
	types: bundle<source>;
	footer?: TypeConf
	actions?: Actions
}

type types = bundle<Type<unknown>>;
type source = bundle<string | source> | string;

export class BaseType<T> implements Type<T> {
	declare partOf: BaseType<T>;
	declare name: string;
	declare prototype: T;
	declare props: bundle<any>;

	types: bundle<Type<T>> = EMPTY.object;

	generalizes(type: Type<T>): boolean {
		return type == this;
	}
	start(name: string, conf: bundle<any>): void {
		this.name = name;
		if (conf) {
			this.props = extend(this.props || null, conf);
		}
		if (conf.prototype) this.prototype = conf.prototype;

		if (conf.proto) {
			this.prototype = extend(this.prototype, conf.proto);
		} else {
			this.prototype = Object.create(this.prototype as any);
		}
		this.prototype["_type"] = this;
	}
	create(...args: any[]): T {
		return Object.create(this.prototype as any);
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

function loadTypes(source: bundle<source>, base: types): types {
	base = Object.create(base);
	let types = Object.create(null);
	for (let name in source) {
		types[name] = getType(name, base, source);
	}
	return types
}

function getType(name: string, types: types, source: source): Type<unknown> {
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

function createType(name: string, conf: TypeConf, types: types, source: source) {
	let supertype = conf.type ? getType(conf.type, types, source) : null;
	let type = Object.create(supertype) as BaseType<unknown>;
	type.start(name, conf)

	if (name) {
		type.name = name;
		types[name] = type;
	}
	type.types = Object.create(supertype.types || null);
	for (let name in conf.types) {
		type.types[name] = getMember(type, name, conf.types[name]);

	}
	return type;

	function getMember(owner: Type<unknown>, name: string, part: source) {
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