import {Signal, Receiver} from "../base/controller";
import { ContentType } from "../base/model";
import { CHAR } from "../base/util";
import { ViewOwner, ViewType } from "../base/view";

export interface Part extends Receiver {
	container?: Part;
	parts: Iterable<Part>;
}

export interface View extends Part {
	type$: ContentType<View>;
	textContent: string;
	append(partsOrText: any): void;
	//content: content;
	//markupContent: string;
}

interface $Peer extends Element {
	$type: ViewType<View>
	$viewer: Viewer;
}
export class Viewer implements View {
	constructor(peer: $Peer) {
		this.#peer = peer;
		peer.$viewer = this;
	}
	#peer: $Peer;
	get type$() {
		return this.#peer.$type;
	}
	get owner() {
		return this.#peer.ownerDocument["$owner"];
	}
	get container() {
		return this.#peer.parentElement["$peer"];
	}
	get peer() {
		return this.#peer;
	}
	get textContent(): string {
		return this.#peer.textContent;
	}
	get parts(): Iterable<Viewer> {
		const nodes = this.#peer.children;
		let parts = Object.create(null);
		parts[Symbol.iterator] = function*() {
			for (let i = 0, len = nodes.length; i < len; i++) {
				let node = nodes[i] as $Peer;
				if (node.$viewer) yield node.$viewer;
			}
		}
		Reflect.defineProperty(this, "parts", {value: parts});
		return parts;
	}
	at(key: string) {
		if (typeof key == "string" && key.charAt(0) == "@") {
			return this.#peer.getAttribute(key.substring(1));
		}
		for (let part of this.parts) {
			if (part.#peer["$key"] == key) return part;
		}
	}
	put(key: string, value: string | Viewer) {
		if (typeof value == "string" && key.charAt(0) == "@") {
			this.#peer.setAttribute(key.substring(1), value);
			return;
		} else if (value instanceof Viewer) {
			if (value.#peer["$key"] = key) {
				this.#peer.append(value.#peer);
			}
		}
	}
	append(part: Viewer) {
		this.#peer.append(part.#peer);
	}
	receive(signal: Signal): void {
		signal.on = this;
		this.type$.receive(signal);
	}
}

export interface DisplayView extends View {
	v_content: Element;
}

// export class DisplayView extends HTMLElement implements DisplayView {
// 	type$: DisplayType
// 	get container(): Part {
// 		for (let parent = this.parentElement; parent; parent = parent.parentElement) {
// 			if (parent["recieve"]) return parent as unknown as Part;
// 		}
// 		return null;
// 	}
// 	get parts(): Iterable<Part> {
// 		return this.children as Iterable<Part>;
// 	}
// 	receive(signal: Signal): void {
// 		signal.on = this;
// 		this.type$.receive(signal);
// 	}
// 	get v_content() {
// 		return this.type$.isPanel ? this.children[1] : this;
// 	}
//}

interface $View extends HTMLElement {
	$type: DisplayType;
	$viewer: Display;
}

class Display extends Viewer implements DisplayView {
	get type$(): DisplayType {
		return super.type$ as DisplayType;
	}
	get v_content(): Element {
		return this.type$.isPanel ? this.peer.children[1] : this.peer;
	}
	get peer(): $View {
		return super.peer as $View;
	}
	get style(): CSSStyleDeclaration {
		return this.peer.style;
	}
	get styles() {
		return this.peer.classList;
	}
	get box() {
		return this.peer.getBoundingClientRect();
	}
	set box(r: DOMRect) {
		this.position(r.left, r.top);
		this.size(r.width, r.height);
	}
	size(width: number, height: number) {
		this.style.width = Math.max(width, 16) + "px";
		this.style.minWidth = this.style.width;
		this.style.height = Math.max(height, 16) + "px";
		this.style.minHeight = this.style.height;
	}
	position(x: number, y: number) {
		this.style.position = "absolute";			
		this.style.left = x + "px";
		this.style.top = y + "px";
	}
	getStyle(name?: string): CSSStyleDeclaration {
		return name ? this.peer.classList[name] : this.peer.style;
	}
}

export class DisplayOwner extends ViewOwner<View> {
	createElement(tagName: string): Element {
		return //this.owner.createElement(tagName);
	}
	getControlOf(view: View): ViewType<View> {
		let type = view.type$;
		if (!type) {
			console.log(view);
		}
		return type as ViewType<View>
	}
}

export abstract class DisplayType extends ViewType<View> {
	declare readonly owner: DisplayOwner;

	get isPanel() {
		return false;
	}

	createView(): View {
		let view = this.owner.createElement(this.conf.tagName || "div") as $Peer;
		view.$type = this;
		return new Display(view);
	}
	getModelView(view: DisplayView) {
		return view.v_content;
	}
	getPartOf(view: DisplayView): DisplayView {
		return view.container as DisplayView;
	}
	getPartsOf(view: DisplayView): Iterable<DisplayView> {
		return view.parts as Iterable<DisplayView>;
	}
	getTextOf(view: DisplayView): string {
		return this.getModelView(view)?.textContent || "";
	}
	setTextOf(view: DisplayView, value: string): void {
		let ele = this.getModelView(view);
		if (ele) ele.textContent = value;
	}
	appendTo(view: DisplayView, value: any): void {
		let ele = this.getModelView(view);
		if (ele) ele.append(value);
	}
}

export function getView(node: Node | Range): DisplayView {
	if (node instanceof Range) node = node.commonAncestorContainer;
	while (node) {
		if (node["type$"]) return node as any;
		node = node.parentElement;
	}
}

export function atStart(ctx: Node, node: Node, offset: number) {
	if (offset != 0) return false;
	while (node && node != ctx) {
		if (node.previousSibling && node.previousSibling.nodeName != "HEADER") return false;
		node = node.parentNode;
	}
	return true;
}

export function rangeIterator(range: Range) {
	return document.createNodeIterator(range.commonAncestorContainer, NodeFilter.SHOW_ALL, 
		(node) => range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
	)
}