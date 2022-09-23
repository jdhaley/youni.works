import {content } from "../../../base/model.js";

import { ViewBox, getView, bindView } from "../../display/display.js";
import { Editor } from "../../../base/editor.js";

export {bindView};

export abstract class BaseEditor extends ViewBox implements Editor {
	declare contentType: string;

	abstract viewContent(model: content): void;
	abstract contentOf(range?: Range): content;
	abstract edit(commandName: string, range: Range, content?: content): Range;
}

export function getEditor(node: Node | Range): Editor {
	return getView(node)?.$control as Editor;
}

export function getChildEditor(editor: Editor, node: Node): Editor {
	if (node == editor.content) return null;
	while (node?.parentElement != editor.content) {
		node = node.parentElement;
	}
	if (node instanceof Element && node["$control"]) return node["$control"] as Editor;
}
