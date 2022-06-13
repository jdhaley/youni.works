import {bundle} from "../util.js";
import {controller} from "../control.js";

import {ViewType, ViewContext, TextType, ListType, RecordType} from "../viewTypes.js";

type Type = ViewType<unknown>;

let TYPES: bundle<typeof ViewType> = {
	text: TextType,
	markup: TextType,
	list: ListType,
	tree: ListType,
	record: RecordType
}

export function baseTypes(controllers: bundle<controller>, context: ViewContext<unknown>): bundle<Type> {
	let types = Object.create(null);
	for (let name in TYPES) {
		let type = new TYPES[name];
		type.name = name;
		type.context = context;
		if (controllers[name]) type.controller = controllers[name];
		types[name] = type;
	}
	return types;
}
