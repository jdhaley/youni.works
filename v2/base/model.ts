import { CommandBuffer } from "./command";
import { Receiver } from "./control";
import { bundle } from "./util";

export type content = string | number | boolean | Date | List | Record;

export interface Type {
	name: string;
	contentType: string;
	partOf?: Type;
	types: bundle<Type>;

	start(name: string, conf: bundle<any>): void;
}

export interface View extends Receiver {
	readonly type: Type;
	readonly content: Content;
	readonly isContainer: boolean;
}

export interface Shape extends View {
	area: Area;
	/** CSS named properties */
	style: Properties;

	size(width: number, height: number): void;
	position(x: number, y: number): void;
	zone(x: number, y: number): Zone;
}

export interface ViewType extends Type {
	owner: ViewOwner;
	types: bundle<ViewType>;
	create(): View;
	toModel(view: Element, range?: Range): content;
	toView(model: content): Element;
	bind(view: Element): void;
	getContentOf(node: Node): Element;
}

/** View owner is the owner type for Editors. */
export interface ViewOwner  {
	getControlOf(value: Element): View;
	unknownType: Type;
	commands: CommandBuffer<Range>;
	getElementById(id: string): Element;
	setRange(range: Range, collapse?: boolean): void;
}


export interface Editable extends Element {
	$controller?: ViewType;
	$control?: EditableView;
}
export interface EditableView extends View {
	type: ViewType;
	edit(commandName: string, range: Range, content?: content): Range;
}

export interface Content {
	readonly classList: Names;
	readonly children: Iterable<Content>;
	textContent: string;
}

interface Names extends Iterable<string> {
	contains(name: string): boolean;
	add(name: string): void;
	remove(name: string): void;
}

export interface List extends Iterable<content> {
	type$?: string;
	length?: number;
}

export interface Record {
	type$?: string;
	[key: string]: content;
}

interface Properties {
	getPropertyValue(name: string): string;
    setProperty(name: string, value: string): void;
    removeProperty(name: string): string;
}

export interface Area {
	x: number,
	y: number,
	width: number,
	height: number
}

export type Zone = "TL" | "TC" | "TR" | "CL" | "CC" | "CR" | "BL" | "BC" | "BR";

export interface Edges {
	top: number,
	right: number,
	bottom: number,
	left: number
}

export function viewType(value: any): string {
	let type = typeOf(value);
	switch (type) {
		case "string":
		case "number":
		case "boolean":
		case "date":
			return "text";
		default:
			return type;
	}
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

