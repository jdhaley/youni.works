import { Article, Editor } from "../base/editor.js";

import { ViewBox, bindViewNode, getView } from "./view.js";
import { Signal } from "../base/control.js";

export { bindViewNode }


export abstract class BaseEditor extends ViewBox implements Editor {
	get owner(): Article {
		return this.type.owner;
	}
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
