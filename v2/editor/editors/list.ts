import { Article, Editor } from "../../base/editor.js";
import { value } from "../../base/model.js";
import { Change } from "../../base/view.js";
import { Replace } from "../commands/replace.js";
import { clearContent, getChildEditor, getView, mark, narrowRange, unmark } from "../util.js";

export default function edit(commandName: string, range: Range, content?: value): Range {
	if (getView(range) != this) console.warn("Invalid edit range");
	range = new ListReplace(this.owner, commandName, this.node.id).exec(range, content);
	this.owner.sense(new Change(commandName, this), this.node);
	return range;
}

export class ListReplace extends Replace {
	constructor(owner: Article, name: string, viewId: string) {
		super(owner, name, viewId);
	}
	startId: string;
	endId: string;

	exec(range: Range, content: value): Range {
		if (!content) content = [];
		if (!(content instanceof Array)) content = [{
			type$: "para", //TODO fix hard coded type.
			content: "" + content
		}];

		this.execBefore(range);
		range = this.execReplace(range, content);
		return this.execAfter(range);
	}
	protected getReplaceRange() {
		let range = super.getReplaceRange();
		if (this.startId) {
			let start = this.owner.getControl(this.startId);
			if (!start) throw new Error(`Start item.id '${this.startId}' not found.`);
			range.setStartAfter(start.node);
		}
		if (this.endId) {
			let end = this.owner.getControl(this.endId);
			if (!end) throw new Error(`End item.id '${this.endId}' not found.`);
			range.setEndBefore(end.node);
		}
		return range;
	}
	/**
	 * Returns a range of the direct descendent views of the list content. 
	 */
	protected getOuterRange(range: Range) {
		range = range.cloneRange();
		let editor = getView(range);
		let start = getChildEditor(editor, range.startContainer);
		if (start) range.setStartBefore(start.node);
		let end = getChildEditor(editor, range.endContainer);
		if (end) range.setEndAfter(end.node);

		let content = editor.content;
		if (!(range.startContainer == content && range.endContainer == content)) {
			throw new Error("Invalid range for edit.");
		}
		return range;
	}	

	protected execBefore(range: Range): Range {
		narrowRange(range);
		mark(range);
		//NB - the outer range is a different range from the
		//passed range and should only be used within this method.
		range = this.getOuterRange(range);
		let view = getView(range);
		this.b = view.getContent(range).outerHTML;
		captureRange(this, view.content, range.startOffset, range.endOffset);
	
		//Capture the before image for undo.
		let before = "";
		for (let i = range.startOffset; i < range.endOffset; i++) {
			let node = view.content.childNodes[i] as Element;
			if (node.outerHTML) before += node.outerHTML;
		}
		this.before = before;
		return range;
	}
	protected execReplace(range: Range, content: value): Range {
		let editor = this.owner.getControl(this.viewId);
		let start = getChildEditor(editor, range.startContainer);
		let end = getChildEditor(editor, range.endContainer);
		if (start && start == end) {
			this.onSingleContainer(range, content, start);
		} else {
			if (start) this.onStartContainer(range, content, start);
			if (end) this.onEndContainer(range, content, end);
		}
		this.onInsert(range, content);
		return range;
	}
	protected execAfter(range: Range): Range {
		range = this.getReplaceRange();
		let view = getView(range);
		this.a = view.getContent(range).outerHTML;
		console.log(this);
		this.after = "";		
		for (let i = range.startOffset; i < range.endOffset; i++) {
			this.after += view.content.children[i].outerHTML;
		}
		return unmark(range);
	}
	protected onStartContainer(range: Range, content: value, start: Editor): void {
		let r = range.cloneRange();
		r.setEnd(start.content, start.content.childNodes.length);
		clearContent(r);
		this.merge(start, r, content, true);
		range.setStartAfter(start.node);
	}
	protected onEndContainer(range: Range, content: value, end: Editor): void {
		let r = range.cloneRange();
		r.setStart(end.content, 0);
		clearContent(r);
		this.merge(end, r, content, false);
		range.setEndBefore(end.node);
	}
	protected merge(view: Editor, range: Range, content: any, isStart: boolean) {
		//overridden for markup
	}
	protected onSingleContainer(range: Range, content: value, container: Editor): void {
		//overridden for markup
	}
	//22-09-07 Same method for list & markup.
	protected onInsert(range: Range, content: value): void {
		range = range.cloneRange();
		range.deleteContents();
		if (!content) return;
		let editor = this.owner.getControl(this.viewId);
		let ctx = editor.content;
		//Ensure the range must be on the list conent. (It may be on a markup line).
		while (range.commonAncestorContainer != ctx) {
			range.setStartBefore(range.commonAncestorContainer);
			range.collapse(true);
		}
		let views = (editor.type.view(content) as Editor).content as Element;
		while (views.firstChild) {
			range.insertNode(views.firstChild);
			range.collapse();
		}
	}
}

/**
 * Finds the views before the range start (if any) and after the range end (if any).
 * Record their ids in the command.
 * This is used to get the extent of the list to be replaced by undo & redo.
 * @param cmd 
 * @param ctx 
 * @param range 
 */
function captureRange(cmd: ListReplace, ctx: Element, start: number, end: number) {
	for (let i = start; i; i--) {
		let node = ctx.childNodes[i - 1] as Element;
		if (node.getAttribute("data-item")) {
			cmd.startId = node.id;
			break;
		}
	}
	for (let i = end; i < ctx.childNodes.length; i++) {
		let node = ctx.childNodes[i] as Element;
		if (node.getAttribute("data-item")) {
			cmd.endId = node.id;
			break;
		}
	}
}
