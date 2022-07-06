import {content} from "../../base/model.js";
import {ViewType} from "../../base/view.js";
import {Controller, Signal} from "../../base/controller.js";
import {Command, CommandBuffer} from "../../base/command.js";
import {bundle} from "../../base/util.js";

import {Display} from "../ui.js";

let NEXT_ID = 1;

export class Article extends Display {
	readonly commands: CommandBuffer<Range> = new CommandBuffer();
}

export abstract class ArticleType extends ViewType<HTMLElement> {
	declare owner: Article;

	// get conf(): bundle<any> {
	// 	return this;
	// }

	abstract edit(commandName: string, range: Range, content?: content): Range;
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

function getShortcuts(view: EditableElement) {
	if (view.$shortcuts) return view.$shortcuts;
	while (view) {
		let shortcuts = view.type$?.conf.shortcuts; //TODO - view.type$?.conf?.shortcuts;
		if (shortcuts) return shortcuts;
		view = view.parentElement as EditableElement;
	}
}

// export interface DisplayConf {
// 	tagName: string;
// 	controller: Controller;
// 	shortcuts: bundle<string>
// }

// export abstract class DisplayType extends ViewType<HtmlView> implements DisplayConf {
// 	declare owner: ViewOwner<HtmlView>;
// 	declare shortcuts: bundle<string>
// 	tagName: string;
// 	controller: Controller = EMPTY.object;

// 	get conf(): DisplayConf 
// 		return this;
// 	}
// }

class DisplayElement extends HTMLElement {
	type$: ViewType<DisplayElement>;
	connectedCallback() {
		this.view_type; //triggers the assignment of type$ if not set.
	}
	get view_type() {
		return this.ownerDocument["$owner"].getControlOf(this);
	}
	get view_model() {
		return this.view_type?.toModel(this);
	}
	get view_controller(): Controller {
		return this.view_type?.conf.controller;
	}
	receive(signal: Signal)  {
		let subject = signal?.subject;
		while (subject) try {
			let action = this.view_controller[subject];
			action && action.call(this.type$, signal);
			subject = (subject != signal.subject ? signal.subject : "");	
		} catch (error) {
			console.error(error);
			//Stop all propagation - esp. important is the enclosing while loop
			subject = "";
		}
	}
}

export class EditableElement extends DisplayElement {
	$shortcuts: bundle<string>;

	connectedCallback() {
		super.connectedCallback();
		if (!this.id) this.id = "" + NEXT_ID++;
		if (!this.$shortcuts) this.$shortcuts = getShortcuts(this);
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