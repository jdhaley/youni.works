import { Content } from "../base/view.js";
import { Bag, Entity, Sequence } from "../base/util.js";
import { ELE, NODE } from "../base/dom.js";
import { BasePart, Owner, Receiver } from "../base/control.js";

class ElementPart extends BasePart {
	declare protected _ele: ELE;
	[Symbol.iterator] = function* parts() {
		const nodes = this._ele.childNodes;
		for (let i = 0, len = nodes.length; i < len; i++) {
			let node = nodes[i];
			if (node["$control"]) yield node["$control"];
		}
	}

	get partOf(): ElementPart {
		for (let node = this._ele as ELE; node; node = node.parentNode as ELE) {
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

class ElementEntity extends ElementPart implements Entity<string> {
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

export class ElementOwner extends Owner<ELE> {
	getControlOf(node: ELE): Receiver {
		return node["$control"];
	}
	getContainerOf(node: ELE): ELE {
		for (let parent = node.parentNode; parent; parent = parent.parentNode) {
			if (parent["$control"]) return parent as ELE;
		}
	}
	getPartsOf(node: ELE): Iterable<ELE> {
		return node.children as Iterable<ELE>;
	}
}