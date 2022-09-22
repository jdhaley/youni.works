import { Content, content } from "../../../base/model.js";

import { LevelCommand } from "../commands/level.js";
import { ListEditor, ListReplace } from "./list.js";
import { getChildEditor, getEditor } from "./editor.js";
import { items, mark, unmark } from "../util.js";
import { Editor } from "../../../base/editor.js";

export class MarkupEditor extends ListEditor {
	contentType = "markup";
	edit(commandName: string, range: Range, content: string) {
		if (getEditor(range) != this) console.warn("fix this check"); //"Invalid edit range"
		let cmd = COMMANDS[commandName];
		if (!cmd) throw new Error("Unrecognized command");
		return cmd.call(this, commandName, range, content);
	}
}

export class MarkupReplace extends ListReplace {
	protected getOuterRange(range: Range) {
		/*
			For markup, the replace range may come from a single line
			(due to merge & join of the start & end). In this case select
			the entire view so that the outer range is like a multi-item range.
		*/
		let editor = getEditor(range);
		if (editor.contentType == "line") {
			range = range.cloneRange();
			range.selectNode(editor.node);
			return range;
		}
		return super.getOuterRange(range);
	}
	protected onSingleContainer(range: Range, content: content, editor: Editor): void {
		//There's a lot going on here so remove the markers so they don't get in the way.
		range = unmark(range);
		
		let ctx = editor.content;
		let r = range.cloneRange();
		//Delete the range within the line.
		r.deleteContents();
		//Get the remainder of the line content.
		r.setEnd(ctx, ctx.childNodes.length);
		//Capture it,.
		let model: Content = editor.contentOf(r) as any;
		//Clear the remainder of the line content.
		r.deleteContents();
		//Append any 'paste' content to the line.
		this.merge(editor.node, r, content, true);

		if (this.name == "Split" && model.type$ == "heading") {
			//Headings split to a para, not another heading.
			model.type$ = "para";
			model.level = 0;
		}
		//Create the end line and add it after the command line.
		let end: Element = editor.type.view(model as any).node as Element;
		editor.node.parentElement.insertBefore(end, editor.node.nextElementSibling);
		//We can now set the new range now that we have the end line.
		range.setEnd(end, 0);
		mark(range);
		range.collapse();
		//Prepend any 'paste' content to the start of the end line.
		r.setStart(end, 0);
		r.collapse(true);
		if (!(this.name == "Split")) this.merge(end, r, content, false);
		//note: onInsert() handles the remainder of the 'paste' content.
	}
	protected onStartContainer(range: Range, content: content, start: Editor): void {
		let r = range.cloneRange();
		r.setEnd(start.content, start.content.childNodes.length);
		r.deleteContents();
		let startItem: Content = start.contentOf() as any;
		let items = content as Content[];
		if (items[0]) {
			startItem.content += "" + items[0].content;
			items[0] = startItem;
		} else {
			items.push(startItem);
		}
		range.setStartBefore(start.node);
	}
	protected merge(view: Element, range: Range, content: any, isStart: boolean) {
		let item: Content = content?.length && content[isStart ? 0 : content.length - 1];
		if (!item) return;

		// 2022-09-15 COMMENTED OUT to handle joining Headings to Paragraphs, etc.
		// TODO this may just be a quick hack. The whole paragraph vs. heading type is still
		// kinda screwy. I think the best way forward is the add the check back in and make
		// headings and paragraphs the same type.
		
		// let listType = getViewById(this.owner, this.viewId).$control.type;
		// let type = listType.types[viewType(item)];
		// if (type == view.$control.type) {
			if (!isStart) items.setItem(view, item.level, item.type$);
			if (item.content) {
				let node = 	view.ownerDocument.createTextNode("" + item.content);
				range.insertNode(node);	
			}
			if (isStart) {
				content.shift();
			} else {
				content.pop();
			}
		// COMMENTED OUT
		// }
	}
}

const COMMANDS = {
	"Cut": replace,
	"Paste": replace,
	"Insert": noop,

	"Entry": replace,
	"Erase": replace,
	"Delete": replace,
	"Promote": level,
	"Demote": level,
	"Split": replace,
	"Join": replace,
}

function noop() {
}

function replace(this: MarkupEditor, commandName: string, range: Range, content?: content): Range {
	let editor = getEditor(range);
	if (editor.contentType == "line") {
		editor = getEditor(editor.node.parentElement);
	}
	if (editor.contentType != "markup") console.warn("View is not markup:", editor);

	return new MarkupReplace(this.owner, commandName, editor.node.id).exec(range, content);
}

function level(this: MarkupEditor, name: "Promote" | "Demote", range: Range): Range {
	if (!this.content.firstElementChild) return;
	let start = getChildEditor(this, range.startContainer);
	let end = getChildEditor(this, range.endContainer);
	//If a range of items, check that there are no headings
	if (start != end) for (let item = start.node; item; item = item.nextElementSibling) {
		let role = getEditor(item).type.name;
		if (role == "heading") {
			console.warn("No range promote with headings");
			return range;
		}
		if (item.id == end.node.id) break;
	}
	return new LevelCommand(this.owner, name, this.node.id).exec(range);
}