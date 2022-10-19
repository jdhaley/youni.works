import { ELE, NODE } from "../base/dom";
import { list, value } from "../base/model";
import { filter } from "../base/view";
import { Bag } from "../base/util";

import { AbstractContainer } from "./v";

export class ElementContainer extends AbstractContainer<NODE> {
	declare _node: ELE;

	get id(): string {
		return this._node.id;
	}
	get styles(): Bag<string> {
		return this._node.classList;
	}
	get contents(): Iterable<NODE> {
		return this._node.childNodes;
	}
	get textContent(): string {
		return this._node.textContent;
	}
	set textContent(text: string) {
		this._node.textContent = text;
	}
	get markupContent(): string {
		return this._node.innerHTML;
	}

	protected viewContent(content: unknown): void {
		throw new Error("Method not implemented.");
	}
	valueOf(filter?: filter): list {
		throw new Error("Method not implemented.");
	}

	at(name: string): string {
		return this._node.getAttribute(name);
	}
	put(name: string, value?: string): void {
		throw new Error("Method not implemented.");
	}

	protected setId(id: string): void {
		this._node.id = id;
	}
	protected createHeader(model?: value) {
		let header = this._node.ownerDocument.createElement("header") as Element;
		header.textContent = this.type.conf.title || "";
		this._node.append(header);
	}
	protected createContent(model?: value) {
		let ele = this._node.ownerDocument.createElement("div") as Element;
		ele.classList.add("content");
		let content = null; //new ElementContent();
		content.control(ele as Element);
		this._node.append(ele);
	}
	protected createFooter(model?: value) {
	}
}