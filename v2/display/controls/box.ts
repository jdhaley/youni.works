import { value } from "../../base/model.js";
import { BoxType, Box } from "../../base/box.js";
import { Actions } from "../../base/control.js";
import { ele, ELE, RANGE } from "../../base/dom.js";
import { bundle } from "../../base/util.js";

import { getView } from "../util.js";
import { ElementView } from "../view.js";

type editor = (this: Box, commandName: string, range: RANGE, content?: value) => RANGE;

export abstract class ElementBox extends ElementView implements Box {
	constructor(actions: Actions, editor: editor) {
		super();
		this.actions = actions;
		if (editor) this["edit"] = editor;
	}
	get type(): BoxType {
		return this._type as BoxType;
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
