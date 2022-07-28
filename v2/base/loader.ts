import {Control, Actions} from "./controller.js";
import {bundle, extend} from "./util.js";
import {ViewOwner, ViewType} from "./view.js";

export interface BaseConf {
	class: typeof Control;
	model: "text" | "record" | "list";
	panel: boolean;
	tagName: string;
	actions: Actions;
	shortcuts: bundle<string>;
}

export interface ViewConf {
	type: string;
	types: bundle<source>;
	conf: bundle<any>;
}

export function loadBaseTypes(owner: ViewOwner<unknown>): bundle<ViewType<any>> {
	if (!owner.conf?.baseTypes) return;
	let types = Object.create(null);
	for (let name in owner.conf.baseTypes) {
		let conf: BaseConf = owner.conf.baseTypes[name];
		let type = new conf.class(conf) as ViewType<unknown>;
		type.name = name;
		type.owner = owner;
		types[name] = type;
	}
	return types;
}

type types = bundle<ViewType<unknown>>;
type source = bundle<string | source> | string

export function loadTypes(source: bundle<source>, base: types): types {
	base = Object.create(base);
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
	let type = Object.create(supertype);
	type.conf = extend(supertype.conf, conf.conf);

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
		let member: ViewType<unknown>;
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