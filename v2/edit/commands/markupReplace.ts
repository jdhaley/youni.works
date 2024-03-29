import { ele, RANGE } from "../../base/dom.js";

import { getEditor, mark, unmark } from "../util.js";
import { ListReplace } from "./listReplace.js";
import { Editor } from "../../base/editor.js";

interface item {
	type$: string
	content?: unknown,
	level?: number,
}

export class MarkupReplace extends ListReplace {
	protected getOuterRange(range: RANGE) {
		/*
			For markup, the replace range may come from a single line
			(due to merge & join of the start & end). In this case select
			the line so that the outer range is like a multi-item range.
		*/
		let editor = getEditor(range);
		if (editor.type.model != "list") {
			range = range.cloneRange();
			range.selectNode(editor.view);
			return range;
		}
		return super.getOuterRange(range);
	}
	protected onStartContainer(range: RANGE, content: unknown, start: Editor): void {
		let r = range.cloneRange();
		r.setEnd(start.content, start.content.childNodes.length);
		r.deleteContents();
		let startItem: item = start.valueOf() as any;
		let items = content as item[];
		if (items[0]) {
			startItem.content += "" + items[0].content;
			items[0] = startItem;
		} else {
			items.push(startItem);
		}
		range.setStartBefore(start.view);
	}
	protected merge(view: Editor, range: RANGE, content: any, isStart: boolean) {
		let item: item = content?.length && content[isStart ? 0 : content.length - 1];
		if (!item) return;

		// 2022-09-15 COMMENTED OUT to handle joining Headings to Paragraphs, etc.
		// TODO this may just be a quick hack. The whole paragraph vs. heading type is still
		// kinda screwy. I think the best way forward is the add the check back in and make
		// headings and paragraphs the same type.
		
		// let listType = this.owner.getControl(this.viewId).type;
		// let type = listType.types[viewType(item)];
		// if (type == view.type) {
			if (!isStart && view.convert && view.level) {
				view.convert(item.type$);
				view.level = item.level;
			}
			if (item.content) {
				let node = 	view.view.ownerDocument.createTextNode("" + item.content);
				range.insertNode(node);	
			}
			if (isStart) {
				content.shift();
			} else {
				content.pop();
			}
		// COMMENTED OUT
		//}
	}
	protected onSingleContainer(range: RANGE, content: unknown, editor: Editor): void {
		//There's a lot going on here so remove the markers so they don't get in the way.
		range = unmark(range);
		
		let ctx = editor.content;
		let r = range.cloneRange();
		//Delete the range within the line.
		r.deleteContents();
		//Get the remainder of the line content.
		r.setEnd(ctx, ctx.childNodes.length);
		//Capture it,.
		let model: item = editor.valueOf(r) as item;
		//Clear the remainder of the line content.
		r.deleteContents();
		//Append any 'paste' content to the line.
		this.merge(editor, r, content, true);

		if (this.name == "Split" && model.type$ == "heading") {
			//Headings split to a para, not another heading.
			model.type$ = "para";
			model.level = 0;
		}
		//Create the end line and add it after the command line.
		let end = editor.type.create(model) as Editor;
		ele(editor.view).after(end.view);
		//We can now set the new range now that we have the end line.
		range.setEnd(end.view, 0);
		mark(range);
		range.collapse();
		//Prepend any 'paste' content to the start of the end line.
		r.setStart(end.view, 0);
		r.collapse(true);
		if (!(this.name == "Split")) this.merge(end, r, content, false);
		//note: onInsert() handles the remainder of the 'paste' content.
	}
}
