import {bundle, extend} from "./util.js";
import {ViewType} from "./viewTypes.js";

type types = bundle<ViewType<unknown>>;
type source = bundle<string | source> | string

export function loadTypes(source: bundle<source>, base: types): types {
	base = Object.create(base);
	let types = Object.create(null);
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

function createType(name: string, value: bundle<source>, types: types, source: source) {
	let supertype = value["type$"] ? getType("" + value["type$"], types, source) : null;
	let type = Object.create(supertype);
	if (name) {
		type.name = name;
		types[name] = type;
	}
	type.types = Object.create(supertype.types || null);
	for (let name in value) {
		if (name != "type$") {
			type.types[name] = getMember(name, value[name]);
		}
	}
	return type;

	function getMember(name: string, part: source) {
		let member: ViewType<unknown>;
		if (typeof part == "object") {
			member = createType("", part, types, source);
			member.name = name;
		} else {
			member = getType(part, types, source);
		}
		if (type.tag == "ui-record") {
			member = Object.create(member);
			member.name = "";
			member.propertyName = name;
		}
		return member;
	}
}
