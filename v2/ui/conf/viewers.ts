import {ElementType, viewType} from "../../base/view.js";
import {List, Record} from "../../base/model.js";
import {CHAR} from "../../base/util.js";

export default {
	text(this: ElementType, view: Element, model: string): void {
		view.textContent =  model || CHAR.ZWSP;
	},
	record(this: ElementType, view: Element, model: Record): void {
		view["$at"] = Object.create(null);
		for (let name in this.types) {
			let type = this.types[name];
			let value = model ? model[name] : null;
			let member = type.toView(value);
			view.append(member);
			view["$at"][name] = member;
		}
		//if (!view.textContent) view.textContent = CHAR.ZWSP;
	},
	list(this: ElementType, view: Element, model: List): void {
		//view.textContent = "";
		if (model && model[Symbol.iterator]) for (let value of model) {
			let type = this["rowType"] || this.types[viewType(value)] || this.owner.unknownType;
			let part = type.toView(value);
			view.append(part);
		}
		//if (!view.textContent) view.append(CHAR.ZWSP);
	}
}
