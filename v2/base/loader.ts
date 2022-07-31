import {Control, Actions} from "./controller.js";
import {bundle, extend} from "./util.js";
import {ViewOwner, ViewType} from "./view.js";

interface BaseConf {
	class: typeof Control;
	model: "text" | "record" | "list";
	actions: Actions;
}

export interface ViewConf {
	type: string;
	types: bundle<source>;
	conf: bundle<any>;
}

export function loadBaseTypes(owner: ViewOwner<unknown>, baseTypes: bundle<BaseConf>): bundle<ViewType<any>> {
	let types = Object.create(null);
	for (let name in baseTypes) {
		let conf: BaseConf = baseTypes[name];
		let type = new conf.class() as ViewType<unknown>;
		type.name = name;
		type.owner = owner;
		type.model = conf.model;
		type.start(conf);
		types[name] = type;
	}
	return types;
}

type types = bundle<ViewType<any>>;
type source = bundle<string | source> | string

export function loadTypes(owner: ViewOwner<any>, source: bundle<source>, base: bundle<BaseConf>): types {
	let baseTypes = loadBaseTypes(owner, base);
	let types: types = Object.create(null);
	for (let name in source) {
		types[name] = getType(name, baseTypes, source);
	}
	return types;
}

function getType(name: string, types: types, source: source) {
	let type = types[name || "default"];
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
	if (!supertype) throw new Error("Can't define a supertype.");
	let type = Object.create(supertype);

	if (name) {
		type.name = name;
		types[name] = type;
	}
	type.types = Object.create(supertype.types || null);
	for (let name in conf.types) {
		type.types[name] = getMember(name, conf.types[name]);
	}
	type.start(extend(supertype.conf || null, conf.conf));
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