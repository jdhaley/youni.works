import { Part, ElementPart } from "../base/control.js";
import { Content, Filter } from "../base/view.js";

export class BaseContent<T extends Part> extends ElementPart<T> implements Content {
	declare contentType: string;

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
	get type() {
		return null;
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
	add(part: BaseContent<T>, before?: BaseContent<T>): void {
		this._ele.insertBefore(part._ele, before._ele);
	}
	remove(part: BaseContent<T>): void {
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
