import { value } from "../../base/model.js";
import { Editor } from "../../base/editor.js";

import { RangeReplace } from "./rangeReplace.js";
import { clearContent, getChildEditor } from "../util.js";
import { ELE } from "../../base/view.js";

export class ListReplace extends RangeReplace {
	exec(range: Range, content: value): Range {
		if (!content) content = [];
		if (!(content instanceof Array)) content = [{
			type$: "para", //TODO fix hard coded type.
			content: "" + content
		}];
		return super.exec(range, content);
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
	protected onSingleContainer(range: Range, content: value, container: Editor): void {
		//overridden for markup
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
		let views = (editor.type.view(content) as Editor).content as ELE;
		while (views.firstChild) {
			range.insertNode(views.firstChild);
			range.collapse();
		}
	}
	protected merge(view: Editor, range: Range, content: any, isStart: boolean) {
		//overridden for markup
	}
}
