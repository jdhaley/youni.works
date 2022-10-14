import { Part, ElementPart } from "../base/control.js";
import { Content, Entity } from "../base/view.js";

export class BaseContent<T extends Part> extends ElementPart<T> implements Content, Entity {
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
	get contents(): Iterable<Content> {
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
}
