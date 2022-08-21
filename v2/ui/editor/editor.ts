import { Command, CommandBuffer } from "../../base/command.js";
import { content } from "../../base/model.js";
import { Receiver } from "../../base/controller.js";
import { unmark } from "./util.js";

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

	abstract exec(range: Range, content: content): Range;
	undo() {
		return this.do(this.before);
	}
	redo() {
		return this.do(this.after);
	}

	protected abstract do(markup: string): Range;
}

/**
 * NoEdit exists for two reasons:
 * - To provide a concrete class to resolve typescript not allowing an abstract class for abstract construction.
 * - To provide a dummy class when a command mapping isn't applicable or supported.
 */
export class NoEdit extends Edit {
	exec(range: Range, content: content): Range {
		//Before
		//Start
		//Middle
		//End
		//After
		return;
	}
	protected do(markup: string): Range {
		return;
	}
}

export abstract class Replace extends Edit {
	protected do(markup: string) {
		let range = this.getDoRange();
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
	
	protected getDoRange(): Range {
		let view = getView(this.owner, this.viewId);
		if (!view) throw new Error(`View "${this.viewId}" not found.`);
		let range = view.ownerDocument.createRange();
		range.selectNodeContents(view.$controller.getContentOf(view));
		return range;
	}
}

export abstract class ReplaceRange extends Replace {
	constructor(owner: Article, name: string, viewId: string) {
		super(owner, name, viewId);
	}
	startId: string;
	endId: string;
	
	protected getDoRange() {
		let range = super.getDoRange();
		if (this.startId) {
			let start = getView(this.owner, this.startId);
			if (!start) throw new Error(`Start item.id '${this.startId}' not found.`);
			range.setStartAfter(start);
		}
		if (this.endId) {
			let end = getView(this.owner, this.endId);
			if (!end) throw new Error(`End item.id '${this.endId}' not found.`);
			range.setEndBefore(end);
		}
		return range;
	}
}
export class StdReplace extends ReplaceRange {
	exec(range: Range, content: content): Range {
		this.doBefore(range, content);
		this.doStart(range, content);
		this.doMiddle(range, content);
		this.doEnd(range, content);
		this.doAfter(range, content);
		return range;
	}
	doBefore(range: Range, content: content): void {
	}
	doStart(range: Range, content: content): void {
	}
	doMiddle(range: Range, content: content): void {
	}
	doEnd(range: Range, content: content): void {
	}
	doAfter(range: Range, content: content): void {
	}
}

function getView(owner: Article, id: string) {
	let view = owner.getElementById(id) as Editable;
	if (!view) throw new Error("Can't find view element.");
	if (!view.$controller) {
		console.warn("view.type$ missing... binding...");
		owner.bindView(view as any);
		if (!view.$controller) throw new Error("unable to bind missing type$");
	} else {
		view.$controller.getContentOf(view); //checks the view isn't corrupted.
	}
	return view;
}
