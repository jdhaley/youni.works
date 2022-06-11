import {bundle, extend} from "./util.js";
import {TextType, CollectionType, RecordType, ViewType, ViewContext} from "./view.js";
import {Controller} from "./control.js";

type types = bundle<ViewType<unknown>>;

let TYPES: types = extend(null, {
	text: new TextType,
	markup: new TextType,
	list: new CollectionType,
	tree: new CollectionType,
	record: new RecordType
});

type source = bundle<string | object>

export function loadTypes(conf: source, controllers: bundle<Controller>, context: ViewContext<unknown>): types {
	for (let name in TYPES) {
		let type = TYPES[name];
		type.name = name;
		type.context = context;
		if (controllers[name]) type.controller = controllers[name];
	}
	for (let name in conf) {
		getType(name, TYPES, conf);
	}
	return TYPES
}

function getType(name: string, types: types, conf: bundle<string | object>) {
	let type = types[name];
	if (!type && conf[name]) {
		let value = conf[name];
		if (typeof value == "object") {
			type = createType(name, value, types, conf);
		} else {
			type = getType(value, types, conf);
		}
	} else if (!type) {
		type = TYPES.text;
		console.error(`Type "${name}" is not defined.`);
	}
	types[name] = type;
	return type;
}

function createType(name: string, value: bundle<any>, types: types, conf: bundle<string | object>) {
	let supertype = value["type$"] ? getType(value["type$"] as string, types, conf) : null;
	let type = Object.create(supertype);
	if (name) {
		type.name = name;
		types[name] = type;
	}
	type.types = Object.create(supertype.types || null);
	let isRecord = type instanceof RecordType;
	for (let name in value) {
		if (name != "type$") {
			let member = value[name];
			if (typeof member == "object") {
				member = createType("", member, types, conf);
				member.name = name;
			} else {
				member = getType(value[name], types, conf);
			}
			if (isRecord) {
				member = Object.create(member);
				member.propertyName = name;
			}
			type.types[name] = member;
		}
	}
	return type;
}
