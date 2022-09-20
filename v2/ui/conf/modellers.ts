import { content, Content, List, Record, Viewer } from "../../base/model.js";
import { ViewType } from "../../base/editor";
import { CHAR } from "../../base/util.js";

export default {
	record(this: ViewType, view: Element, range?: Range): Record {
		let model = recordContent(this, null, view, range);
		if (model) {
			model["type$"] = this.name;
		}
		return model;
	},
	list: listContent,
	markup: listContent,
	text: textContent,
	line(this: ViewType, view: Element, range?: Range): Content {
		if (range && !range.intersectsNode(view)) return;
		let content = textContent.call(this, view, range);
		let item: Content = {
			type$: view.getAttribute("data-item"),
			content: content,
		}
		let level = Number.parseInt(view.getAttribute("aria-level"));
		if (level) item.level = level;
		return item;
	}
}

function recordContent(contextType: ViewType, model: Record, view: Element, range: Range): Record {
	if (range && !range.intersectsNode(view)) return model;
	
	for (let child of view.children) {
		if (child.classList.contains("field")) {
			let viewer = child["$control"] as Viewer;
			let value = viewer.getData(range);
			if (value) {
				if (!model) model = Object.create(null);
				model[viewer.type.name] = value;
			}
		} else {
			model = recordContent(contextType, model, child, range);
		}
	}
	return model;
}

function getContentElement(view: Element, range?: Range) {
	if (range && !range.intersectsNode(view)) return;
	if (view.classList.contains("content")) return view;
	for (let child of view.children) {
		child = getContentElement(child, range);
		if (child) return child;
	}
}

function listContent(this: ViewType, view: Element, range?: Range): List {
	let model: content[];
	let content = getContentElement(view, range);
	if (content) for (let part of content.children) {
		let view = part["$control"];
		let value = view?.getData(range);
		if (value) {
			if (!model) {
				model = [];
				if (this.name) model["type$"] = this.name;
			}
			model.push(value);
		}
	}
	return model;
}

function textContent(this: ViewType, view: Element, range?: Range): string {
	let model = "";
	let content = getContentElement(view, range);

	if (content) for (let node of content.childNodes) {
		if (node == range?.startContainer) {
			model += node.textContent.substring(range.startOffset);
		} else if (node == range?.endContainer) {
			model += node.textContent.substring(0, range.endOffset);
		} else {
			model += node.textContent;
		}
	}
	model = model.replace(CHAR.ZWSP, "");
	model = model.replace(CHAR.NBSP, " ");
	model = model.trim();
	return model;
}
