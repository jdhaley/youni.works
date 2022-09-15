import {Owner} from "./controller.js";
import {bundle} from "./util.js";

export interface Type {
	name: string;
	types: bundle<Type>;
	view: string;
	model: string;
	isProperty: boolean;

	generalizes(type: Type): boolean;
	start(name: string, conf: bundle<any>): void;
}

interface ViewConf {
	type: string;
	types: bundle<source>;
	conf: bundle<any>;
}

type types = bundle<Type>;
type source = bundle<string | source> | string;

export abstract class TypeOwner<V> extends Owner<V> {
	constructor(conf: bundle<any>) {
		super();
		let base = loadBaseTypes(this, conf.baseTypes);
		this.actions = conf.actions;
		this.types = loadTypes(conf.viewTypes, base);
		this.unknownType = this.types[conf.unknownType];
		console.info("Types:", this.types, "uknown type:", this.unknownType);
	}
	types: bundle<Type>;
	unknownType: Type;
}

function loadBaseTypes(owner: TypeOwner<unknown>, baseTypes: bundle<any>): bundle<Type> {
	let types = Object.create(null);
	for (let name in baseTypes) {
		let conf = baseTypes[name];
		let type: Type = new conf.class(owner) as any;
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

function getType(name: string, types: types, source: source): Type {
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

function createType(name: string, conf: ViewConf, types: types, source: source) {
	let supertype = conf.type ? getType(conf.type, types, source) : null;
	let type = Object.create(supertype) as Type;
	type.start(name, conf)

	if (name) {
		type.name = name;
		types[name] = type;
	}
	type.types = Object.create(supertype.types || null);
	for (let name in conf.types) {
		type.types[name] = getMember(name, conf.types[name]);
	}
	return type;

	function getMember(name: string, part: source) {
		let member: Type;
		if (typeof part == "object") {
			member = createType("", part as any, types, source);
		} else {
			member = getType(part, types, source);
			member = Object.create(member);
		}
		member.name = name;
		member.isProperty = type.model == "record" ? true : false;
		return member;
	}
}