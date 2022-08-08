import { content, List, Record } from "../../base/model.js";
import { ElementType } from "../../base/view.js";
import { CHAR } from "../../base/util.js";

export default {
	list(this: ElementType, view: Element, range?: Range): List {
		let model: content[];
		let content = getContent(view, range);
		if (content) for (let part of content.children) {
			let type = this.owner.getControlOf(part) as ElementType;
			let value = type?.toModel(part, range);
			if (value) {
				if (!model) {
					model = [];
					if (this.name) model["type$"] = this.name;
				}
				model.push(value);	
			}
		}
		return model;
	},
	record(this: ElementType, view: Element, range?: Range): Record {
		let model: Record;
		let content = getContent(view, range);
		if (content) for (let part of content.children) {
			let type = this.owner.getControlOf(part) as ElementType;
			let value = type?.toModel(part, range);
			if (value) {
				if (!model) {
					model = Object.create(null);
					model.type$ = this.name;
				}
				model[type.propertyName] = value;
			}
		}
		return model;
	},
	text(this: ElementType, view: Element, range?: Range): string {
		let model = "";
		let content = getContent(view, range);
		if (content) for (let node of content.childNodes) {
			if (node == range?.startContainer) {
				model += node.textContent.substring(range.startOffset);
			} else if (node == range?.endContainer) {
				model += node.textContent.substring(0, range.endOffset);
			} else {
				model += node.textContent;
			}
		}
		return model === CHAR.ZWSP ? "" : model;
	}
}

function getContent(view: Element, range: Range) {
	let content = view["$content"];
	if (!content || range && !range.intersectsNode(content)) return;
	return content;
}