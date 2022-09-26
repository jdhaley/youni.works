import {content } from "../base/model.js";
import { Article, Editor } from "../base/editor.js";

import { ViewBox, ViewType, getViewNode, bindViewNode, getView } from "./view.js";
import { Signal } from "../base/control.js";

export { getViewNode, bindViewNode }


export abstract class BaseEditor extends ViewBox implements Editor {
	get owner(): Article {
		return this.type.owner;
	}
	declare contentType: string;
	declare type: ViewType;

	abstract viewContent(model: content): void;
	abstract contentOf(range?: Range): content;
	abstract edit(commandName: string, range: Range, content?: content): Range;
}

export class Change implements Signal {
	constructor(command: string, editor?: Editor) {
		this.direction = editor ? "up" : "down";
		this.subject = "change";
		this.source = editor;
		this.commandName = command;
	}
	direction: "up" | "down";
	subject: string;
	source: Editor;
	commandName: string;
}

export function getEditor(node: Node | Range): Editor {
	let view = getView(node);
	if (view instanceof BaseEditor) return view;
}

export function getChildEditor(editor: Editor, node: Node): Editor {
	if (node == editor.content) return null;
	while (node?.parentElement != editor.content) {
		node = node.parentElement;
	}
	if (node instanceof Element && node["$control"]) return node["$control"] as Editor;
}
