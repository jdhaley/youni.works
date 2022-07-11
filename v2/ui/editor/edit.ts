import {content} from "../../base/model.js";
import {ViewType} from "../../base/view.js";
import {Command, CommandBuffer} from "../../base/command.js";

import {Display} from "../ui.js";
import {getView, ViewElement} from "../../base/dom.js";

export class Article extends Display {
	readonly commands: CommandBuffer<Range> = new CommandBuffer();
	save(): void {
		let model = this.type.toModel(this.view);
		console.log(model);
		this.service.save(this.view.getAttribute("data-file"), JSON.stringify(model, null, 2), this);
	}
}

export abstract class EditType extends ViewType<HTMLElement> {
	declare readonly owner: Article;

	get isPanel() {
		return true;
	}
	abstract edit(commandName: string, range: Range, content?: content): Range;

	create(): HTMLElement {
		let view = this.owner.frame.create(this.conf.tagName || "div");
		view["type$"] = this;
		if (this.propertyName) {
			view.dataset.name = this.propertyName;
		} else {
			view.dataset.type = this.name;
		}
		if (this.isPanel) {
			view.append(this.owner.frame.create("header"));
			view.firstChild.textContent = this.conf.title || "";
			view.append(this.owner.frame.create("div"));
		}
		return view;
	}

	getPartOf(view: ViewElement): ViewElement {
		return view.$container || view.parentElement;
	}
	getPartsOf(view: ViewElement): Iterable<ViewElement> {
		return view.$content || view.children as Iterable<ViewElement>;
	}
	getTextOf(view: HTMLElement): string {
		let ele = this.isPanel ? view.children[1] : view;
		return ele ? ele.textContent : "";
	}
	setTextOf(view: HTMLElement, value: string): void {
		let ele = this.isPanel ? view.children[1] : view;
		ele.textContent = value;
	}
	appendTo(view: HTMLElement, value: any): void {
		let ele = this.isPanel ? view.children[1] : view;
		ele.append(value);
	}
}

export abstract class Edit extends Command<Range> {
	constructor(owner: Article, name: string, viewId: string) {
		super();
		this.owner = owner;
		this.name = name;
		this.timestamp = Date.now();
		this.viewId = viewId;
		owner.commands.add(this);
	}
	owner: Article;
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
		if (range) this.owner.frame.selectionRange = range;
		return range;
	}

	undo() {
		return this.exec(this.before);
	}
	redo() {
		return this.exec(this.after);
	}
}

function replace(range: Range, markup: string) {
	let view = getView(range);
	let type = view.$type;
	view = type.create();
	view.innerHTML = markup;
	
	range.deleteContents();
	range.collapse();
	while (view.firstElementChild) {
		range.insertNode(view.firstElementChild);
		range.collapse();
	}
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
