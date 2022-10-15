import { BasePart, Part } from "../base/control.js";
import { Content, Entity } from "../base/view.js";
import { Collection } from "../base/util.js";
import { ELE, TREENODE } from "../base/dom.js";

export class ElementPart<T extends Part> extends BasePart<T> {
	declare protected _ele: ELE;
	[Symbol.iterator] = function* parts() {
		const nodes = this._ele.childNodes;
		for (let i = 0, len = nodes.length; i < len; i++) {
			let node = nodes[i];
			if (node["$control"]) yield node["$control"];
		}
	}

	get partOf(): T {
		for (let node = this._ele as TREENODE; node; node = node.parentNode) {
			let control = node["$control"];
			if (control) return control;
		}	
	}

	control(node: Element) {
		if (node["$control"]) {
			this.uncontrol(node);
		}
		node["$control"] = this;
		this._ele = node;
	}
	uncontrol(node: Element) {
		if (node["$control"]) {
			throw new Error("Node is already controlled.");
		}
	}
}

export class ContentEntity<T extends Part> extends ElementPart<T> implements Content, Entity {
	get contents() {
		return this._ele.childNodes;
	}
	get id(): string {
		return this._ele.id;
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
	get styles(): Collection<string> {
		return this._ele.classList;
	}
	get node(): ELE {
		return this._ele
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
