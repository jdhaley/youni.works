import { Part, ElementPart } from "../base/control";
import { value } from "../base/model";

interface Content extends Part, Entity {
	readonly type: unknown;
	readonly contentType: string;
	readonly contents: Iterable<Content>;

	textContent: string;
	markupContent: string;

	edit(commandName: string, filter?: Filter, content?: value): unknown;
	valueOf(filter?: Filter): value;
}

interface Filter {
}

interface Entity {
	id: string;
	at(name: string): string;
	put(name: string, value?: string): void;
}


export class ContentView<T extends Part> extends ElementPart<T> implements Content, Entity {
	declare type: unknown;
	declare contentType: "";

	get id(): string {
		return this._ele.id;
	}
	set id(id: string) {
		this._ele.id = id;
	}
	get textContent() {
		return this._ele.textContent;
	}
	set textContent(text: string) {
		this._ele.textContent = text;
	}
	get markupContent() {
		return this._ele.innerHTML;
	}
	set markupContent(markup: string) {
		this._ele.innerHTML = markup;
	}
	get contents() {
		return this;
	}

	at(name: string): string {
		return this._ele.getAttribute(name);
	}
	put(name: string, value?: string): void {
		if (value === undefined) {
			this._ele.removeAttribute(name);
		} else {
			this._ele.setAttribute(name, value);
		}
	}
	valueOf(filter?: any): unknown {
		return null;
	}
	edit(commandName: string, filter?: Filter, content?: unknown): unknown {
		return null;
	}
	add(part: ContentView<T>, before?: ContentView<T>): void {
		this._ele.insertBefore(part._ele, before._ele);
	}
	remove(part: ContentView<T>): void {
		this._ele.removeChild(part._ele);
	}
}



	// arcs: Iterable<Arc>;
	// size(width: number, height: number): void {
	// 	throw new Error("Method not implemented.");
	// }
	// position(x: number, y: number): void {
	// 	throw new Error("Method not implemented.");
	// }
	// zone(x: number, y: number): Zone {
	// 	throw new Error("Method not implemented.");
	// }

	// declare type: unknown;
	// get content(): Iterable<Content> {
	// 	return this.contentNode.parts as Iterable<Content>;
	// }
	// get area(): Area {
	// 	return this._ele.getBoundingClientRect();
	// }
	// get styles(): Collection<string> {
	// 	return this._ele.classList;
	// }

	// getStyle(name: string): string {
	// 	return (this._ele as HTMLElement).style?.getPropertyValue(name);
	// }
	// setStyle(name: string, value?: string): boolean {
	// 	let style = (this._ele as HTMLElement).style;
	// 	if (style) {
	// 		if (value || value === "") {
	// 			style.setProperty(name, "" + value);
	// 		} else {
	// 			style.removeProperty(name);
	// 		}
	// 		return true;
	// 	}
	// 	return false;
	// }
	// valueOf(filter?: any): unknown {
	// 	return null;
	// }
	// instance(element: Element): X<T> {
	// 	let part = Object.create(this);
	// 	element["$control"] = part;
	// 	part._ele = element;
	// 	return part;
	// }
	// protected get contentNode(): Content {
	// 	return this;
	// }
