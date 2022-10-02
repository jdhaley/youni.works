import { content } from "../../base/model.js";

import { LevelCommand } from "../commands/level.js";
import { ListEditor, ListReplace } from "./list.js";
import { Editor, Change } from "../../box/editor.js";
import { getChildEditor, getView, mark, unmark } from "../util.js";
import { Line, LineEditor } from "./line.js";

export class MarkupEditor extends ListEditor {
	contentType = "markup";
	edit(commandName: string, range: Range, content: string) {
		if (getView(range) != this) console.warn("fix this check"); //"Invalid edit range"
		let cmd = COMMANDS[commandName];
		if (!cmd) throw new Error("Unrecognized command");
		range = cmd.call(this, commandName, range, content);
		this.owner.sense(new Change(commandName, this), this.node);
		return range;
	}
}

export class MarkupReplace extends ListReplace {
	protected getOuterRange(range: Range) {
		/*
			For markup, the replace range may come from a single line
			(due to merge & join of the start & end). In this case select
			the entire view so that the outer range is like a multi-item range.
		*/
		let editor = getView(range);
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
		let model: Line = editor.contentOf(r) as Line;
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
		let end = editor.type.view(model as any) as Editor;
		editor.node.parentElement.insertBefore(end.node, editor.node.nextElementSibling);
		//We can now set the new range now that we have the end line.
		range.setEnd(end.node, 0);
		mark(range);
		range.collapse();
		//Prepend any 'paste' content to the start of the end line.
		r.setStart(end.node, 0);
		r.collapse(true);
		if (!(this.name == "Split")) this.merge(end, r, content, false);
		//note: onInsert() handles the remainder of the 'paste' content.
	}
	protected onStartContainer(range: Range, content: content, start: Editor): void {
		let r = range.cloneRange();
		r.setEnd(start.content, start.content.childNodes.length);
		r.deleteContents();
		let startItem: Line = start.contentOf() as any;
		let items = content as Line[];
		if (items[0]) {
			startItem.content += "" + items[0].content;
			items[0] = startItem;
		} else {
			items.push(startItem);
		}
		range.setStartBefore(start.node);
	}
	protected merge(view: Editor, range: Range, content: any, isStart: boolean) {
		let item: Line = content?.length && content[isStart ? 0 : content.length - 1];
		if (!item) return;

		// 2022-09-15 COMMENTED OUT to handle joining Headings to Paragraphs, etc.
		// TODO this may just be a quick hack. The whole paragraph vs. heading type is still
		// kinda screwy. I think the best way forward is the add the check back in and make
		// headings and paragraphs the same type.
		
		// let listType = this.owner.getControl(this.viewId).type;
		// let type = listType.types[viewType(item)];
		// if (type == view.type) {
			if (!isStart && view instanceof LineEditor) {
				view.convert(item.type$);
				view.level = item.level;
			}
			if (item.content) {
				let node = 	view.node.ownerDocument.createTextNode("" + item.content);
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
}

const COMMANDS = {
	"Cut": replace,
	"Paste": replace,
	"Insert": replace,

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
	let editor = getView(range);
	if (editor.contentType == "line") {
		editor = getView(editor.node.parentElement);
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
		let role = getView(item).type.name;
		if (role == "heading") {
			console.warn("No range promote with headings");
			return range;
		}
		if (item.id == end.node.id) break;
	}
	return new LevelCommand(this.owner, name, this.node.id).exec(range);
}