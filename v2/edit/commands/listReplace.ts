import { value } from "../../base/model.js";
import { Editor } from "../../base/editor.js";

import { RangeReplace } from "./rangeReplace.js";
import { clearContent, getChildEditor } from "../util.js";
import { ELE, RANGE } from "../../base/dom.js";
export class ListReplace extends RangeReplace {
	exec(range: RANGE, content: value): RANGE {
		if (!content) content = [];
		if (!(content instanceof Array)) content = [{
			type$: "para", //TODO fix hard coded type.
			content: "" + content
		}];
		return super.exec(range, content);
	}
	protected execReplace(range: RANGE, content: value): RANGE {
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
	protected onSingleContainer(range: RANGE, content: value, container: Editor): void {
		//overridden for markup
	}
	protected onStartContainer(range: RANGE, content: value, start: Editor): void {
		let r = range.cloneRange();
		r.setEnd(start.content.node, start.content.node.childNodes.length);
		clearContent(r);
		this.merge(start, r, content, true);
		range.setStartAfter(start.node);
	}
	protected onEndContainer(range: RANGE, content: value, end: Editor): void {
		let r = range.cloneRange();
		r.setStart(end.content.node, 0);
		clearContent(r);
		this.merge(end, r, content, false);
		range.setEndBefore(end.node);
	}
	protected onInsert(range: RANGE, value: value): void {
		range = range.cloneRange();
		range.deleteContents();
		if (!value) return;
		let editor = this.owner.getControl(this.viewId);
		let ctx = editor.content.node;
		//Ensure the range must be on the list conent. (It may be on a markup line).
		while (range.commonAncestorContainer != ctx) {
			range.setStartBefore(range.commonAncestorContainer);
			range.collapse(true);
		}
		editor = editor.type.create() as Editor;
		editor.view(value);
		let contents = editor.content.contents;
		while (contents.length) {
			range.insertNode(contents[0]); //this also removes the entry from the sequence.
			range.collapse();
		}
	}
	protected merge(view: Editor, range: RANGE, content: any, isStart: boolean) {
		//overridden for markup
	}
}
