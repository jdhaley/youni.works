import { List, Record } from "../../base/model.js";
import { CHAR } from "../../base/util.js";
import {viewType, ViewType} from "../../base/view.js";

export default {
	text(this: ViewType<unknown>, view: unknown, model: string): void {
		this.setTextOf(view, model || CHAR.ZWSP);
	},
	record(this: ViewType<unknown>, view: unknown, model: Record) {
		view["$at"] = Object.create(null);
		for (let name in this.types) {
			let type = this.types[name];
			let value = model ? model[name] : null;
			let member = type.toView(value);
			this.appendTo(view, member);
			view["$at"][name] = member;
		}
		//if (!view.textContent) view.textContent = CHAR.ZWSP;
	},
	list(this: ViewType<unknown>, view: unknown, model: List) {
		//view.textContent = "";
		if (model && model[Symbol.iterator]) for (let value of model) {
			let type = this["rowType"] || this.types[viewType(value)] || this.owner.unknownType;
			let part = type.toView(value);
			this.appendTo(view, part);
		}
		//if (!view.textContent) view.append(CHAR.ZWSP);
	}
}
