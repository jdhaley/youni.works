import { content, List, Record } from "../../base/model.js";
import { ElementType } from "../../base/dom.js";
import { CHAR } from "../../base/util.js";

export default {
	record(this: ElementType, view: Element, range?: Range): Record {
		let model = recordContent(this, null, view, range);
		if (model) model["type$"] = this.name;
		return model;
	},
	list(this: ElementType, view: Element, range?: Range): List {
		let model: content[];
		let content = getContentElement(view, range);
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
	text(this: ElementType, view: Element, range?: Range): string {
		let model = "";
		let content = getContentElement(view, range);

		//HACK TO HANDLE PANEL-LESS TEXT... (DIRECT TEXT IN VIEW)
		if (!view.children.length) content = view;

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

function recordContent(contextType: ElementType, model: Record, element: Element, range: Range): Record {
	if (range && !range.intersectsNode(element)) return model;
	
	for (let child of element.children) {
		let type = child["$controller"] as ElementType;
		if (type?.model) {
			if (contextType.model == "record" && !(type.isProperty && contextType.types[type.name])) {
				console.warn(`Found property "${type.name}" that is not part of the record type.`);
			}
			let value = type.toModel(child, range);
			if (value) {
				if (!model) model = Object.create(null);
				model[type.name] = value;
			}
		} else {
			model = recordContent(contextType, model, child, range);
		}
	}
	return model;
}

function getContentElement(view: Element, range: Range) {
	if (!range?.intersectsNode(view)) return;
	if (view.classList.contains("view")) return view;
	for (let child of view.children) {
		child = getContentElement(child, range);
		if (child) return child;
	}
}
