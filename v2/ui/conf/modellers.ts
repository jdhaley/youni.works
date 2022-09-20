import { content, Content, List, Record, View, Viewer } from "../../base/model.js";
import { CHAR } from "../../base/util.js";

export default {
	record(this: Viewer, range?: Range): Record {
		let model = recordContent(null, this.content as Element, range);
		if (model) {
			model["type$"] = this.type.name;
		}
		return model;
	},
	list: listContent,
	markup: listContent,
	text: textContent,
	line(this: Viewer, range?: Range): Content {
		let line = this["_node"] as Element;
		if (range && !range.intersectsNode(line)) return;
		let content = textContent.call(this, range);
		let item: Content = {
			type$: line.getAttribute("data-item"),
			content: content,
		}
		let level = Number.parseInt(line.getAttribute("aria-level"));
		if (level) item.level = level;
		return item;
	}
}

function recordContent(model: Record, view: Element, range: Range): Record {
	if (range && !range.intersectsNode(view)) return model;
	
	for (let child of view.children) {
		if (child.classList.contains("field")) {
			let viewer = child["$control"] as Viewer;
			let value = viewer.contentOf(range);
			if (value) {
				if (!model) model = Object.create(null);
				model[viewer.type.name] = value;
			}
		} else {
			model = recordContent(model, child, range);
		}
	}
	return model;
}

// function getContentElement(view: View, range?: Range) {
// 	if (range && !range.intersectsNode(view as Element)) return;
// 	if (view.classList.contains("content")) return view;
// 	for (let child of view.children) {
// 		child = getContentElement(child, range);
// 		if (child) return child;
// 	}
// }

function listContent(this: Viewer, range?: Range): List {
	let model: content[];
	if (range && !this.intersectsRange(range)) return;
	for (let part of this.content.children) {
		let view = part.$control;
		let value = view?.contentOf(range);
		if (value) {
			if (!model) {
				model = [];
				if (this.type.name) model["type$"] = this.type.name;
			}
			model.push(value);
		}
	}
	return model;
}

function textContent(this: Viewer, range?: Range): string {
	let model = "";
	if (range && !this.intersectsRange(range)) return;
	for (let node of (this.content as Element).childNodes) {
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
