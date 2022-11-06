import { model, value } from "../base/model.js";
import { Article, ArticleType, Viewer, Editable, Edits, Extent, NodeContent, ViewFrame } from "../base/article.js";
import { ELE, NODE, RANGE, VIEW_ELE, bindViewEle, getView, DOCUMENT } from "../base/dom.js";
import { bundle, Sequence } from "../base/util.js";

import { ElementOwner, ElementShape } from "./element.js";
import { Receiver } from "../base/control.js";
import { Location } from "../base/remote.js";

export class ElementContent extends ElementShape implements NodeContent<NODE> {
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
	get node(): ELE {
		return this._ele;
	}
}

export abstract class ElementView extends ElementContent implements Viewer<NODE> {
	declare _type: ArticleType<NODE>;

	get type(): ArticleType<NODE> {
		return this._type;
	}
	get content(): NodeContent<NODE> {
		return this;
	}
	get partOf() {
		for (let node = this._ele.parentNode as ELE; node; node = node.parentNode as ELE) {
			let control = node["$control"];
			if (control) return control;
			//Propagate events to the owner when this is a top-level view in the body.
			if (node == node.ownerDocument.body) return this.type.owner;
		}
	}

	abstract valueOf(range?: RANGE): value;
	abstract viewValue(data: value): void;

	view(value: value, parent?: ElementView): void {
		if (parent) (parent.content.node as ELE).append(this._ele);
		this.node.textContent = "";
		this.viewValue(value as value);
		this.kind.add("content");
	}
	control(element: VIEW_ELE) {
		super.control(element as Element);
		element.setAttribute("data-item", this.type.name);
	}
	uncontrol(element: ELE): void {
		super.uncontrol(element as Element);
		element.removeAttribute("data-item");
		delete element.id;
	}
}

export class ElementViewType extends  ArticleType<NODE> {
	constructor(owner: Article<Node>) {
		super();
		this.owner = owner;
	}
	declare owner: Article<NODE>;

	get model(): model {
		return this.owner.conf.contentTypes[this.conf.viewType];
	}

	create(value: value, container?: ElementView): ElementView {
		let view = super.create() as ElementView;
		let node = this.owner.createNode(this.conf.tagName || "div");
		view.control(node as ELE);
		view.view(value, container);
		return view;
	}
	control(node: ELE): ElementView {
		let view = super.create() as ElementView;
		view.control(node);
		return view;
	}
}

export abstract class ElementViewOwner extends ElementOwner {
	constructor(conf: bundle<any>) {
		super();
		/*
		NOTE: the conf MUST have conf.viewTypes and conf.baseTypes
		*/
		this.conf = conf;
		this.actions = conf.actions;
	}
	source: value;
	frame: ViewFrame<NODE>;
	node: ELE;
	conf: bundle<any>;
	types: bundle<ElementViewType>;
	unknownType: ElementViewType;
	defaultType: ElementViewType;

	createNode(tagName: string): ELE {
		return this.frame.createNode(tagName) as ELE;
	}
	
	findNode(id: string): ELE {
		return this.node.ownerDocument.getElementById(id);
	}
	getControl(id: string): Viewer<NODE> {
		let ele = this.findNode(id) as VIEW_ELE;
		if (!ele) throw new Error("Can't find view element.");
		if (!ele.$control) {
			console.warn("binding...");
			bindViewEle(ele);
			if (!ele.$control) {
				console.error("Unable to bind missing control. Please collect info / analyze.");
				debugger;
			}
		}
		return ele.$control as Viewer<NODE>;
	}
	getPath(node: NODE, offset: number): string {
		let view = getView(node) as Editable<NODE, RANGE>;
		let path = "/" + offset;
		while (node) {
			if (node == view.content.node) {
				return view.id + path;
			}
			path = "/" + getNodeIndex(node.parentNode, node) + path;
			node = node.parentNode;
		}
		return path;
	}
	rangeFrom(startPath: string, endPath: string): RANGE {
		let doc = this.node.ownerDocument;
		let range = doc.createRange();
		let path = startPath.split("/");
		let node = getNode(doc, path);
		if (node) {
			let offset = Number.parseInt(path.at(-1));
			range.setStart(node, offset);
		}
		path = endPath.split("/");
		node = getNode(doc, path);
		if (node) {
			let offset = Number.parseInt(path.at(-1));
			range.setEnd(node, offset);
		}
		return range;
	}
	play(edits: Edits) {
		let type = this.types[edits.type];
		let view = type.create(edits.source);
		this.node = view.node;
		this.frame.append(this.node);
		for (let edit of edits.edits) {
			let editor = this.getControl(edit.viewId) as Editable<NODE, RANGE>;
			let range = this.rangeFrom(edit.range.start, edit.range.end);
			editor.edit(edit.name, range, edit.value);
		}
	}
}

function getNodeIndex(parent: NODE, node: NODE): number {
	for (let i = 0; i < parent?.childNodes.length; i++) {
		if (parent.childNodes[i] == node) {
			return i;
		}
	}
}
function getNode(doc: DOCUMENT, path: string[]) {
	let view = getView(doc.getElementById(path[0])) as Editable<NODE, RANGE>;
	if (!view) console.error("can't find view");
	let node = view.content.node;
	for (let i = 1; i < path.length - 1; i++) {
		let index = Number.parseInt(path[i]);
		node = node?.childNodes[index];
	}
	return node;
}