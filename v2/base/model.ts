export interface Type {
	name: string;
	generalizes(type: Type): boolean;
}

export type content = string | number | boolean | Date | List | Record;

export interface List extends Iterable<content> {
	type$?: string;
	length?: number;
}

export interface Record {
	type$?: string;
	[key: string]: content;
}

export function typeOf(value: any): string {
	if (value?.valueOf) value = value.valueOf(value);
	let type = typeof value;
	switch (type) {
		case "string":
		case "number":
		case "boolean":
			return type;
		case "object":
			if (value == null) break;
			if (value["type$"]) {
				let type = value["type$"];
				return type.name || "" + type;
			}
			if (value instanceof Date) return "date";
			if (value[Symbol.iterator]) return "list";
			return "record";
	}
	return "null";
}
