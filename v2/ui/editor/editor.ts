import { Command, CommandBuffer } from "../../base/command.js";
import { content } from "../../base/model.js";
import { Receiver } from "../../base/controller.js";
import { getChildView, unmark } from "./util.js";

export interface Editable extends Element {
	$controller?: Editor
}

export interface Editor  {
	readonly model: string;
	readonly owner: Article;
	toModel(view: Element, range?: Range, id?: true): content;
	toView(model: content): Element;
	getContentOf(node: Node): Element;
	edit(commandName: string, range: Range, content?: content): Range;
}

export interface Article extends Receiver {
	readonly commands: CommandBuffer<Range>;
	bindView(element: Element): void;
	getElementById(id: string): Element;
	setRange(range: Range, collapse?: boolean): void;
}

export class Edit extends Command<Range> {
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

	undo(): Range {
		return;
	}
	redo(): Range {
		return;
	}
	exec(range: Range, content: content): Range {
		return;
	}
}


export abstract class Replace extends Edit {
	undo() {
		return this.replace(this.before);
	}
	redo() {
		return this.replace(this.after);
	}
	protected replace(markup: string) {
		let range = this.getReplaceRange();
		let div = range.commonAncestorContainer.ownerDocument.createElement("div");
		div.innerHTML = markup;
		range.deleteContents();
		while (div.firstChild) {
			let node = div.firstChild;
			range.insertNode(node);
			range.collapse();
			if (node.nodeType == Node.ELEMENT_NODE) {
				this.owner.bindView(node as any);
			}
		}
		range = unmark(range);
		return range;
	}
	protected getReplaceRange(): Range {
		let view = getViewById(this.owner, this.viewId);
		if (!view) throw new Error(`View "${this.viewId}" not found.`);
		let range = view.ownerDocument.createRange();
		range.selectNodeContents(view.$controller.getContentOf(view));
		return range;
	}
}

/**
 * Replacement supporting replacement of start/end children in a view.
 */
export class ReplaceRange extends Replace {
	constructor(owner: Article, name: string, viewId: string) {
		super(owner, name, viewId);
	}
	startId: string;
	endId: string;

	exec(range: Range, content: content): Range {
		this.execBefore(range, content);
		this.execReplace(range, content);
		this.execAfter(range, content);
		return range;
	}

	protected execBefore(range: Range, content: content): void {
	}
	protected execReplace(range: Range, content: content): void {
	}
	protected execAfter(range: Range, content: content): void {
	}
	protected getReplaceRange() {
		let range = super.getReplaceRange();
		if (this.startId) {
			let start = getViewById(this.owner, this.startId);
			if (!start) throw new Error(`Start item.id '${this.startId}' not found.`);
			range.setStartAfter(start);
		}
		if (this.endId) {
			let end = getViewById(this.owner, this.endId);
			if (!end) throw new Error(`End item.id '${this.endId}' not found.`);
			range.setEndBefore(end);
		}
		return range;
	}

	/**
	 * Returns a range of the direct descendent views of the list content.
	 * @param ctx 
	 * @param range 
	 */
	protected getOuterRange(ctx: Element, range: Range) {
		range = range.cloneRange();
		let start = getChildView(ctx, range.startContainer);
		if (start) range.setStartBefore(start);
		let end = getChildView(ctx, range.endContainer);
		if (end) range.setEndAfter(end);

		if (!(range.startContainer == ctx && range.endContainer == ctx)) {
			throw new Error("Invalid range for edit.");
		}
		return range;
	}
}

function getViewById(owner: Article, id: string) {
	let view = owner.getElementById(id) as Editable;
	if (!view) throw new Error("Can't find view element.");
	if (view.getAttribute("data-item")) return view;
	if (!view.$controller) {
		console.warn("view.type$ missing... binding...");
		owner.bindView(view as any);
		if (!view.$controller) throw new Error("unable to bind missing type$");
	} else {
		view.$controller.getContentOf(view); //checks the view isn't corrupted.
	}
	return view;
}
