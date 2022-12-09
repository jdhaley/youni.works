import { ele, ELE, RANGE } from "../../base/dom.js";
import { xmlContent } from "../../transform/content.js";

import { unmark, bindViewEle, narrowRange, mark, getEditor, getChildEditor, clearContent } from "../editUtil.js";
import { Replace } from "./replaceCmd.js";
import { Editor, EditorType } from "../../base/editor.js";

export class RangeReplace extends Replace {
	startId: string;
	endId: string;

	protected execReplace(range: RANGE, value: unknown) {
		clearContent(range);
		if (value) mergeContent(range, value);
	}
	protected execBefore(range: RANGE) {
		narrowRange(range);
		mark(range);
		//NB - the outer range is a different range from the
		//passed range and should only be used within this method.
		range = this.getOuterRange(range);
		let view = getEditor(range);
		captureRange(this, view.content, range.startOffset, range.endOffset);
		this.before = xmlContent(view, range).innerHTML;
	}
	protected execAfter(range: RANGE): RANGE {
		range = this.getReplaceRange();
		let view = getEditor(range);
		this.after = xmlContent(view, range).innerHTML;
		return unmark(range);
	}
	protected getOuterRange(inner: RANGE) {
		let editor = getEditor(inner);
		let outer = inner.cloneRange();
		outer.selectNodeContents(editor.content);
		let start = getChildEditor(editor, inner.startContainer);
		if (start) outer.setStartBefore(start.view);
		let end = getChildEditor(editor, inner.endContainer);
		if (end) outer.setEndAfter(end.view);

		let content = editor.content;
		if (!(outer.startContainer == content && outer.endContainer == content)) {
			throw new Error("Invalid range for edit.");
		}
		return outer;
	}	
	protected getReplaceRange() {
		let editor = this.owner.getControl(this.viewId) as Editor;
		if (!editor) throw new Error(`View "${this.viewId}" not found.`);
		let range = editor.view.ownerDocument.createRange();
		range.selectNodeContents(editor.content);
		if (this.startId) {
			let start = this.owner.getControl(this.startId);
			if (!start) throw new Error(`Start item.id '${this.startId}' not found.`);
			range.setStartAfter(start.view);
		}
		if (this.endId) {
			let end = this.owner.getControl(this.endId);
			if (!end) throw new Error(`End item.id '${this.endId}' not found.`);
			range.setEndBefore(end.view);
		}
		return range;
	}
	protected doReplace(markup: string) {
		let view = this.owner.getControl(this.viewId) as Editor;
		let range = this.getReplaceRange();
		range.deleteContents();
		let nodes = createViewNodes(view.type, markup);
		while (nodes.length) {
			let ele = nodes[0];
			range.insertNode(ele);
			range.collapse();
			bindViewEle(ele);
		}
		//Make sure the view event is sent to the newly created nodes:
		//TODO need to add send method to Article interface.
		(this.owner as any).owner.send("view", view.view);
		return unmark(range);
	}
}

const XELE = document.implementation.createDocument(null, "root").documentElement;
function createViewNodes(type: EditorType, markup: string) {
	XELE.innerHTML = markup;
	//TODO contentedit refactoring - editor won't have content attribute.
	return (type.create(XELE) as Editor).content.children;
}

function mergeContent(range: RANGE, value: unknown) {
	let editor = getEditor(range);
	let start = getChildEditor(editor, range.startContainer);
	let end = getChildEditor(editor, range.endContainer);
	for (let member = ele(start.view) || ele(editor.view).firstElementChild; member; member = member.nextElementSibling) {
		let control = member["$control"] as Editor;
		if (control?.type.model == "unit") {
			let mvalue = value[control.type.name];
			if (mvalue) {
				//member.children[1].textContent += mvalue;
				control.content.textContent += mvalue;
			}
		}
		if (member == end.view) break;
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
 function captureRange(cmd: RangeReplace, ctx: ELE, start: number, end: number) {
	for (let i = start; i; i--) {
		let node = ctx.childNodes[i - 1] as ELE;
		if (node.getAttribute("data-item")) {
			cmd.startId = node.id;
			break;
		}
	}
	for (let i = end; i < ctx.childNodes.length; i++) {
		let node = ctx.childNodes[i] as ELE;
		if (node.getAttribute("data-item")) {
			cmd.endId = node.id;
			break;
		}
	}
}
