import {Control, Actions, Owner, Controller} from "../base/controller.js";
import {bundle, extend} from "../base/util.js";

export interface BaseConf {
	class: typeof Control;
	view: "text" | "record" | "list";
	model: "text" | "record" | "list";
	panel: boolean;
	tagName: string;
	actions: Actions;
	shortcuts: bundle<string>;
}

interface ViewConf {
	type: string;
	types: bundle<source>;
	conf: bundle<any>;
}

interface Type extends Controller<unknown, unknown> {
	extend(name: string, conf: bundle<any>): Type;
	owner: Owner<unknown>;
	name: string;
	propertyName?: string;
	model: string;
	types: bundle<Type>;
}

type types = bundle<Type>;
type source = bundle<string | source> | string;

export abstract class TypeOwner<V> extends Owner<V> {
	constructor(conf?: bundle<any>) {
		super(conf);
		this.conf = conf;
	}
	conf: bundle<any>;
	types: bundle<Type>;
	unknownType: Type;

	getControlOf(view: V): Controller<any, V> {
		let type = view["$controller"];
		if (!type) {
			console.log(view);
		}
		return type;
	}
	
	initTypes(source: bundle<any>) {
		this.types = loadTypes(this, source) as bundle<Type>;
		this.unknownType = this.types[this.conf.unknownType];
	}
}

export function loadBaseTypes(owner: TypeOwner<unknown>, base: bundle<BaseConf>): bundle<Type> {
	if (!owner.conf?.baseTypes) return;
	let types = Object.create(null);
	for (let name in owner.conf.baseTypes) {
		let conf: BaseConf = base[name];
		let type = new conf.class(conf) as unknown as Type;
		type.name = name;
		type.owner = owner;
		types[name] = type;
	}
	return types;
}

export function loadTypes(owner: TypeOwner<unknown>, source: bundle<source>): types {
	let base = loadBaseTypes(owner, owner.conf.baseTypes)
	let types: types = Object.create(null);
	for (let name in source) {
		types[name] = getType(name, base, source);
	}
	return types
}

function getType(name: string, types: types, source: source) {
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
	let type: Type = supertype.extend(name, conf);
	if (name) types[name] = type;
	for (let name in conf.types) {
		type.types[name] = getMember(name, conf.types[name]);
	}
	return type;

	function getMember(name: string, part: source) {
		let member: Type;
		if (typeof part == "object") {
			member = createType("", part as any, types, source);
			member.name = name;
		} else {
			member = getType(part, types, source);
		}
		if (type.model == "record") {
			member = Object.create(member);
			member.name = "";
			member.propertyName = name;
		}
		return member;
	}
}