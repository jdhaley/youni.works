import {content} from "../../base/model.js";
import {ViewType} from "../../base/view.js";
import {Command, CommandBuffer} from "../../base/command.js";

import {Display, DisplayElement} from "../ui.js";

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
	abstract edit(commandName: string, range: Range, content?: content): Range;
}

let NEXT_ID = 1;

export class EditElement extends DisplayElement {
	connectedCallback() {
		super.connectedCallback();
		if (!this.id) this.id = "" + NEXT_ID++;
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

export function getView(node: Node | Range): DisplayElement {
	if (node instanceof Range) node = node.commonAncestorContainer;
	while (node) {
		if (node instanceof DisplayElement) return node as DisplayElement;
		node = node.parentElement;
	}
}
export function toView(range: Range): DisplayElement {
	let type = getView(range)?.view_type;
	let view = type.owner.create(type);
	let frag = range.cloneContents();
	while (frag.firstChild) view.append(frag.firstChild);
	return view;
}

function replace(range: Range, markup: string) {
	let view = getView(range);
	let type = view.view_type;
	view = type.owner.create(type);
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
