import {content } from "../../../base/model.js";

import { Display, getView } from "../../display/display.js";
import { Editor } from "../../../base/editor.js";

export abstract class BaseEditor extends Display implements Editor {
	declare node: HTMLElement;
	declare contentType: string;

	abstract viewContent(model: content): void;
	abstract contentOf(range?: Range): content;
	abstract edit(commandName: string, range: Range, content?: content): Range;
}

export function getViewer(node: Node | Range): Editor {
	return getView(node).$control;
}
