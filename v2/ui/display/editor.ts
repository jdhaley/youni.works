import {content } from "../../base/model.js";

import { ViewBox, ViewType, getViewNode, bindViewNode } from "./view.js";
import { Article, ArticleType, Editor } from "../../base/editor.js";
import { bundle } from "../../base/util.js";

export { getViewNode, bindViewNode as bindView }

export class EditorType extends ViewType implements ArticleType {
	declare owner: Article;
	declare types: bundle<EditorType>;
	view(content?: content): Editor {
		return super.view(content) as Editor;
	}
}

export abstract class BaseEditor extends ViewBox implements Editor {
	get owner(): Article {
		return this.type.owner;
	}
	declare contentType: string;
	declare type: EditorType;

	abstract viewContent(model: content): void;
	abstract contentOf(range?: Range): content;
	abstract edit(commandName: string, range: Range, content?: content): Range;
}

export function getEditor(node: Node | Range): Editor {
	return getViewNode(node)?.$control as Editor;
}

export function getChildEditor(editor: Editor, node: Node): Editor {
	if (node == editor.content) return null;
	while (node?.parentElement != editor.content) {
		node = node.parentElement;
	}
	if (node instanceof Element && node["$control"]) return node["$control"] as Editor;
}
