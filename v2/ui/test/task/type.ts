import { compile, TYPE } from "./compiler.js";
import { Descriptor } from "./facets.js";

export interface Type {
	name: string,
	definedIn: Type,
	conf: {
		[name: string]: any
	}
	prototype: object,
		//@toStringName
		//@type
		//members...
	descriptors: {
		[name: string]: Descriptor
	}
	implements: {
		[name: string]: Type
	}
}

export function process(source: object, name: string) {
	return createType(compile(source, name), null);
}

function createType(target: object, partOf: Type) {
	let type = Object.create(null);
	type.name = target[Symbol.toStringTag];
	type.definedIn = partOf;
	type.conf = null;
	type.prototype = target;
	type.descriptors = target[TYPE][TYPE];
	type.implements = Object.create(null);
	for (let name in target[TYPE]) {
		type.implements[name] = target[TYPE][name];
	}
	type.prototype[TYPE] = type;
	return type;
}