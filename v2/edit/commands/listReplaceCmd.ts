import { ELE, RANGE } from "../../base/dom.js";

import { clearContent, getChildEditor } from "../editUtil.js";
import { RangeReplace } from "./rangeReplaceCmd.js";
import { Editor } from "../../base/editor.js";

export class ListReplace extends RangeReplace {
	exec(range: RANGE, content: unknown): RANGE {
		if (!content) content = [];
		if (!(content instanceof Array)) content = [{
			type$: "para", //TODO fix hard coded type.
			content: "" + content
		}];
		return super.exec(range, content);
	}
	protected execReplace(range: RANGE, content: unknown): RANGE {
		let editor = this.owner.getControl(this.viewId) as Editor;
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
	protected onStartContainer(range: RANGE, content: unknown, start: Editor): void {
		let r = range.cloneRange();
		r.setEnd(start.content, start.content.childNodes.length);
		clearContent(r);
		this.merge(start, r, content, true);
		range.setStartAfter(start.view);
	}
	protected onEndContainer(range: RANGE, content: unknown, end: Editor): void {
		let r = range.cloneRange();
		r.setStart(end.content, 0);
		clearContent(r);
		this.merge(end, r, content, false);
		range.setEndBefore(end.view);
	}
	protected onInsert(range: RANGE, value: unknown): void {
		range = range.cloneRange();
		range.deleteContents();
		if (!value) return;
		let editor = this.owner.getControl(this.viewId) as Editor;
		let ctx = editor.content;
		//Ensure the range must be on the list conent. (It may be on a markup line).
		while (range.commonAncestorContainer != ctx) {
			range.setStartBefore(range.commonAncestorContainer);
			range.collapse(true);
		}
		//
		let contents = createContent(editor, value);
		while (contents.length) {
			range.insertNode(contents[0]); //this also removes the entry from the sequence.
			range.collapse();
		}
	}
	protected onSingleContainer(range: RANGE, content: unknown, container: Editor): void {
		//overridden for markup
	}
	protected merge(view: Editor, range: RANGE, content: any, isStart: boolean) {
		//overridden for markup
	}
}

function createContent(editor: Editor, value: unknown) {
	let view = editor.view.parentNode as ELE;
	editor = editor.type.create() as Editor;
	view.append(editor.view);
	editor.draw(value);
	editor.view.remove();
	return editor.content.childNodes;
}
