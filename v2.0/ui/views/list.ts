import {content, List, typeOf} from "../../model.js";
import {CHAR} from "../../util.js";
import {View, ViewType} from "./view.js";

class ListView extends View {
	constructor() {
		super();
	}
}
customElements.define('ui-list', ListView);

export class ListType extends ViewType {
	tag = "ui-list";
	defaultType: ViewType
	toModel(view: View): content {
		let model = [];
		if (this.name) model["type$"] = this.name;

		let parts = this.context.getPartsOf(view);
		if (parts) for (let child of parts) {
			let type = child.view_type;
			//if (!type) throw new Error(`Type "${typeName}" not found.`);
			model.push(type.toModel(child));
		}
		return model.length ? model : undefined;
	}
	viewContent(view: View, model: List): void {
		// let level = view.getAttribute("aria-level") as any * 1 || 0;
		// level++;
		view.textContent = "";
		if (model && model[Symbol.iterator]) for (let value of model) {
			let type = this.types[typeOf(value)] || this.defaultType;
			let child = type.toView(value);
			child.dataset.type = type.name;
			view.append(child);
		} else {
			view.append(CHAR.ZWSP);
		}
	}
}