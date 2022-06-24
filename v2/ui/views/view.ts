import {Owner, Control, Controller, Receiver} from "../../base/control.js";
import {Command, CommandBuffer} from "../../base/command.js";
import {content, ContentType, Type} from "../../base/model.js";
import {bundle, EMPTY} from "../../base/util.js";
import {Frame} from "../ui.js";

/*
The is global HTML attribute: Allows you to specify that a standard HTML element
should behave like a registered custom built-in element.

The "is" option of the Document.createElement() method.
*/
const OBSERVED_ATTRIBUTES = [];
let NEXT_ID = 1;

export class View extends HTMLElement {
	constructor() {
		super();
	}
	static get observedAttributes() {
		return OBSERVED_ATTRIBUTES;
	}

	declare parentElement: View;
	$control: ViewType;
	$shortcuts: bundle<string>;

	get view_model() {
		return this.$control?.toModel(this);
	}
	get view_type() {
		if (this.$control) return this.$control;
		for (let view: Element = this; view; view = view.parentElement) {
			if (view["$control"]) {
				let ctx = view["$control"];
				if (ctx?.types) {
					let type = ctx.types[this.dataset.name || this.dataset.type];
					this.$control = type || UNDEFINED_TYPE;
					return type;
				}
			};
		}
	}
	
	connectedCallback() {
		this.id = "" + NEXT_ID++;
		if (!this.$shortcuts) this.$shortcuts = getShortcuts(this);
	}
	adoptedCallback() {
		this.connectedCallback();
	}
	disconnectedCallback() {
	}
	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
	}
}
function getShortcuts(view: View) {
	if (view.$shortcuts) return view.$shortcuts;
	while (view) {
		let shortcuts = view.$control?.conf?.shortcuts;
		if (shortcuts) return shortcuts;
		view = view.parentElement;
	}
}

export class ViewOwner extends Controller implements Owner<View> {
	constructor(frame: Frame) {
		super();
		this.owner = frame;
		this.buffer = new CommandBuffer();
	}
	readonly owner: Frame;
	readonly buffer: CommandBuffer<Range>;
	// types: bundle<ViewType>;
	// type: ViewType;
	// view: View;
	// model: content;

	createView(type: ViewType): View {
		let view = this.owner.create(type.tag) as View;
		view.$control = type;
		return view;
	}
	getPartsOf(value: View): Iterable<View> {
		return value.children as Iterable<View>;
	}
	getPartOf(value: View): View {
		return value.parentElement;
	}
	getControllerOf(value: View): Receiver {
		return value.$control;
	}
}

export class ViewType extends Control<View> implements ContentType<View> {
	owner: ViewOwner;
	tag: string;
	types: bundle<ViewType> = EMPTY.object;
	declare name?: string;
	declare propertyName?: string;

	toView(model: content): View {
		let view = this.owner.createView(this);
		this.viewContent(view, model);
		return view;
	}
	toModel(view: View): content {
		return undefined;
	}
	viewContent(view: View, model: content): void {
	}
	generalizes(type: Type): boolean {
		return type == this;
	}
	rangeView(range: Range) {
		let view = this.owner.createView(this);
		let frag = range.cloneContents();
		while (frag.firstChild) view.append(frag.firstChild);
		return view;
	}
	edit(commandName: string, range: Range, replacement?: content): Range {
		// let cmd = new EditCommand(this, commandName);
		// this.owner.buffer.add(cmd);
		// let ele = this.owner.createView(this);
		// ele.innerHTML = replacement;
		// range = cmd.do(range, ele, replacer);
		// console.log(cmd.items);
		// return range;
		return null;
	}
}

export abstract class ViewCommand extends Command<Range> {
	constructor(owner: ViewOwner, name: string, view: View) {
		super();
		this.owner = owner;
		this.name = name;
		this.timestamp = Date.now();
		this.viewId = view.id;
		owner.buffer.add(this);
	}
	owner: ViewOwner;
	name: string;
	timestamp: number;
	viewId: string;
	before: string;
	after: string;

	protected abstract getRange(): Range;

	protected exec(markup: string) {
		let range = this.getRange();
		replace(range, markup);
		range = unmark(range);
		if (range) this.owner.owner.selectionRange = range;
		return range;
	}

	undo() {
		return this.exec(this.before);
	}
	redo() {
		return this.exec(this.after);
	}
}

let UNDEFINED_TYPE = new ViewType();

export function viewType(value: any): string {
	if (value?.valueOf) value = value.valueOf(value);
	switch (typeof value) {
		case "string":
		case "number":
		case "boolean":
			return "text";
		case "object":
			if (value["type$"]) {
				let type = value["type$"];
				return type.name || "" + type;
			}
			if (value instanceof Date) return "date";
			if (value[Symbol.iterator]) return "list";
			return "record";
		default:
			return "null";
	}
}

export function getView(node: Node | Range): View {
	if (node instanceof Range) node = node.commonAncestorContainer;
	while (node) {
		if (node instanceof View) return node;
		node = node.parentElement;
	}
}

export function replace(range: Range, markup: string) {
	let view = getView(range);
	let type = view.view_type;
	view = type.owner.createView(type);
	view.innerHTML = markup;
	
	range.deleteContents();
	range.collapse();
	while (view.firstElementChild) {
		range.insertNode(view.firstElementChild);
		range.collapse();
	}
}
export function markup(range: Range): string {
	let frag = range.cloneContents();
	let div = range.commonAncestorContainer.ownerDocument.createElement("div");
	while (frag.firstChild) {
		div.append(frag.firstChild);
	}
	return div.innerHTML;
}

export function mark(range: Range) {
	let marker = insertMarker(range, "end");
	range.setEndAfter(marker);
	marker = insertMarker(range, "start");
	range.setStartBefore(marker);

	function insertMarker(range: Range, point: "start" | "end") {
		let marker = range.commonAncestorContainer.ownerDocument.createElement("I");
		marker.id = point + "-marker";
		range = range.cloneRange();
		range.collapse(point == "start" ? true : false);
		range.insertNode(marker);
		return marker;
	}	
}

 export function unmark(range: Range) {
	let doc = range.commonAncestorContainer.ownerDocument;
	//Patch the replacement points.
	let pt = patchPoint(doc.getElementById("start-marker"));
	if (pt) range.setStart(pt.startContainer, pt.startOffset);
	pt = patchPoint(doc.getElementById("end-marker"));
	if (pt) range.setEnd(pt.startContainer, pt.startOffset);
	return range;

	function patchPoint(point: ChildNode) {
		if (!point) return;
		let range = point.ownerDocument.createRange();
		if (point.previousSibling && point.previousSibling.nodeType == Node.TEXT_NODE &&
			point.nextSibling && point.nextSibling.nodeType == Node.TEXT_NODE
		) {
			let offset = point.previousSibling.textContent.length;
			point.previousSibling.textContent += point.nextSibling.textContent;
			range.setStart(point.previousSibling, offset);
			range.collapse(true);
			point.nextSibling.remove();
		} else {
			range.setStartBefore(point);
			range.collapse(true);
		}
		point.remove();
		return range;
	}	
}
