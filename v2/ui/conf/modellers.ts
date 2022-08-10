import { content, List, Record } from "../../base/model.js";
import { ElementType } from "../../base/dom.js";
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
		let model = down(this, null, view, range);
		if (model) model["type$"] = this.name;
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

function down(recordType: ElementType, model: Record, element: Element, range: Range): Record {
	if (range && !range.intersectsNode(element)) return model;
	
	for (let child of element.children) {
		let type = child["$controller"];
		if (type?.isProperty) {
			if (!recordType?.types[type.name]) {
				console.warn(`Found property "${type.name}" that is not part of the record type.`);
			}
			let value = type?.toModel(child, range);
			if (value) {
				if (!model) model = Object.create(null);
				model[type.name] = value;
			}
		} else {
			model = down(recordType, model, child, range);
		}
	}
	return model;
}