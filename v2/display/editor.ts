import { contentType, value } from "../base/model.js";
import { View, ViewOwner, ViewType } from "../base/view.js";
import { CommandBuffer } from "../base/command.js";
import { Receiver, Graph, Actions } from "../base/control.js";
import { bundle, Sequence } from "../base/util.js";
import { ele, ELE, NODE, RANGE } from "../base/dom.js";
import { ElementView } from "./view.js";
import { NodeContent } from "./content.js";
import { viewTypes } from "./FROMVIEW.js";
import { getView } from "./util.js";

export interface ArticleType extends ViewType {
	readonly owner: Article;
}

export interface Editor extends View, NodeContent {
	readonly type: ArticleType;
	readonly id: string;
	readonly contents: Sequence<NODE>;
	readonly contentType: contentType;
	readonly content: NodeContent;

	edit(commandName: string, range: RANGE, replacement?: value): RANGE;
	getContent(range?: RANGE): ELE;
}

export interface ItemEditor extends Editor {
	level: number;
	demote(): void;
	promote(): void;
	convert(type: string): void;
}

export interface Article extends ViewOwner, Graph<NODE>, Receiver {
	node: ELE;
	commands: CommandBuffer<RANGE>;

	getControl(id: string): Editor;
	setRange(extent: RANGE, collapse?: boolean): void;
	createElement(tag: string): ELE;
}

type editor = (this: Editor, commandName: string, range: RANGE, content?: value) => RANGE;

export abstract class EditorView extends ElementView implements Editor {
	constructor(actions: Actions, editor: editor) {
		super();
		this.actions = actions;
		if (editor) this["edit"] = editor;
	}
	get type(): ArticleType {
		return this._type as ArticleType;
	}
	get contentType(): contentType {
		return viewTypes[this._type.conf.viewType];
	}
	get shortcuts(): bundle<string> {
		return this._type.conf.shortcuts;
	}

	getContent(range?: RANGE): ELE {
		return viewContent(this, range);
	}
}


function viewContent(view: ElementView, range: RANGE, out?: ELE) {
	if (range && !range.intersectsNode(view.content.node)) return;
	let item: ELE;
	if (!out) {
		item = document.implementation.createDocument("", view.type.name).documentElement as unknown as ELE;
	} else {
		item = out.ownerDocument.createElement(view.type.name);
		out.append(item);
	}
	if (view.id) item.id = view.id;
	let level = view.at("aria-level");
	if (level) item.setAttribute("level", level);
	content(view, range, item);
	return item;
}

function content(view: ElementView, range: RANGE, out: ELE) {
	for (let node of view.content.contents) {
		if (range && !range.intersectsNode(node))
			continue;
		let childView = getView(node);
		if (childView != view) {
			viewContent(childView, range, out);
		} else if (ele(node)) {
			out.append(ele(node).cloneNode(true));
		} else {
			let text = node.textContent;
			if (range) {
				if (node == range?.startContainer && node == range?.endContainer) {
					text = node.textContent.substring(range.startOffset, range.endOffset);
				} else if (node == range?.startContainer) {
					text = node.textContent.substring(range.startOffset);
				} else if (node == range?.endContainer) {
					text = node.textContent.substring(0, range.endOffset);
				}
			}
			out.append(text);
		}
	}
}
