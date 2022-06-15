import { bundle } from "./util";

export type content = string | number | boolean | Date | List | Record;

export interface List extends Iterable<content> {
}

export interface Record  {
	[key: string]: content
}

export interface Type {
	name?: string;
	generalizes(type: Type): boolean;
}

export interface ContentType<V> extends Type {
	types?: bundle<ContentType<V>>
	propertyName?: string;
	toModel(view: V): content;
	toView(model: content): V;
}

export interface Signal {
	readonly direction: "up" | "down"
	subject: string;
	from?: any;
	on?: any;
}

export interface Receiver {
	receive(signal: Signal): void;
}

export function typeOf(value: any): string {
	if (value?.valueOf) value = value.valueOf(value);
	switch (typeof value) {
		case "string":
			//using STX/ETX control codes...
			//if (value.substring(0, 1) == "\u0002") return "markup";
		case "number":
		case "boolean":
			return "text";
		case "object":
//			if (value instanceof Markup) return "markup";
			if (value["type$"]) return value["type$"];
			if (value[Symbol.iterator]) return "list";
			return "record";
		default:
			return "null";
	}
}