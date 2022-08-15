import { content, List, Record } from "../../base/model.js";
import { ElementType } from "../../base/dom.js";
import { CHAR } from "../../base/util.js";

export default {
	record(this: ElementType, view: Element, range?: Range, id?: true): Record {
		let model = recordContent(this, null, view, range, id);
		if (model) {
			model["type$"] = this.name;
			if (id) model["id$"] = view.id;
		}
		return model;
	},
	list(this: ElementType, view: Element, range?: Range, id?: true): List {
		let model: content[];
		let content = getContentElement(view, range);
		if (content) for (let part of content.children) {
			let type = this.owner.getControlOf(part) as ElementType;
			let value = type?.toModel(part, range, id);
			if (value) {
				if (!model) {
					model = [];
					if (this.name) model["type$"] = this.name;
					if (id) model["id$"] = view.id;
				}
				model.push(value);
			}
		}
		return model;
	},
	text(this: ElementType, view: Element, range?: Range, id?: true): string {
		let model = "";
		let content = getContentElement(view, range);

		// USING editable class should remove the need for this hack
		// (editable is either on the view or the content element)
		//
		// //HACK TO HANDLE PANEL-LESS TEXT... (DIRECT TEXT IN VIEW)
		// if (!view.children.length) content = view;

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
		if (id) model = view.id + ":" + model;
		return model;
	}
}

function recordContent(contextType: ElementType, model: Record, view: Element, range: Range, id?: true): Record {
	if (range && !range.intersectsNode(view)) return model;
	
	for (let child of view.children) {
		let type = child["$controller"] as ElementType;
		if (type?.model) {
			if (contextType.model == "record" && !(type.isProperty && contextType.types[type.name])) {
				console.warn(`Found property "${type.name}" that is not part of the record type.`);
			}
			let value = type.toModel(child, range, id);
			if (value) {
				if (!model) model = Object.create(null);
				model[type.name] = value;
			}
		} else {
			model = recordContent(contextType, model, child, range, id);
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
