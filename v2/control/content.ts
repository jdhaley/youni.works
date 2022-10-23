import { Content } from "../base/view.js";
import { ELE, NODE } from "../base/dom.js";
import { Entity, Sequence, Bag } from "../base/util.js";
import { ElementShape } from "./element.js";

class ElementEntity extends ElementShape implements Entity<string> {
	get id(): string {
		return this._ele.id;
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

export class ElementContent extends ElementEntity implements Content {
	get contents(): Sequence<NODE> {
		return this._ele.childNodes;
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
	get styles(): Bag<string> {
		return this._ele.classList;
	}
	get node(): ELE {
		return this._ele;
	}
}
