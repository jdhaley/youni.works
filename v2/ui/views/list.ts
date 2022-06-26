import {View, ViewType} from "../../base/view.js";
import {content, List, viewType} from "../../base/model.js";
import {CHAR} from "../../base/util.js";
import {BaseType} from "./view.js";


class ListView extends View {
	constructor() {
		super();
	}
}
customElements.define("ui-list", ListView);

export class ListType extends BaseType {
	tag = "ui-list";
	defaultType: ViewType
	toModel(view: View): content {
		let model = [];
		if (this.name) model["type$"] = this.name;

		let parts = this.owner.getPartsOf(view);
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
			let type = this.types[viewType(value)] || this.defaultType;
			let child = type.toView(value);
			child.dataset.type = type.name;
			view.append(child);
		} else {
			view.append(CHAR.ZWSP);
		}
	}
}