import {content, List, viewType} from "../../base/model.js";
import {CHAR} from "../../base/util.js";
import {Display, DisplayType} from "../display.js";

class ListView extends Display {
	constructor() {
		super();
	}
}
customElements.define("ui-list", ListView);

export class ListType extends DisplayType {
	tagName = "ui-list";
	defaultType: DisplayType
	toModel(view: Display): content {
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
	viewContent(view: Display, model: List): void {
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