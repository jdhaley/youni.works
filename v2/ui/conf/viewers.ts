import {Content, List, Record, typeOf, View, viewType} from "../../base/model.js";
import { ViewType } from "../../base/editor";

export default {
	text(this: ViewType, view: View, model: string): void {
		view.textContent =  model || "";
	},
	record(this: ViewType, view: View, model: Record): void {
		view["$at"] = Object.create(null);
		for (let name in this.types) {
			let type = this.types[name];
			let value = model ? model[name] : null;
			let member = type.view(value);
			member.classList.add("field");
			view.append(member);
			view["$at"][name] = member;
		}
	},
	list(this: ViewType, view: View, model: List): void {
		if (model && model[Symbol.iterator]) for (let item of model) {
			let type = this["rowType"] || this.types[viewType(item)] || this.owner.unknownType;
			let part = type.view(item);
			view.append(part);
		}
	},
	markup(this: ViewType, view: View, model: Content[]): void {
		if (model && model[Symbol.iterator]) for (let item of model) {
			let type = this["rowType"] || this.types[viewType(item)] || this.owner.unknownType;
			let part = type.view(item);
			view.append(part);
		}
	},
	line(this: ViewType, view: View, item: Content): void {
		let impl = view as Element;
		impl.innerHTML = "" + (item.content || "");
		if (item.type$ == "heading") {
			impl.setAttribute("role", "heading");
		}
		if (item.level) {
			impl.setAttribute("aria-level", "" + item.level);
			if (item.type$ == "para") impl.setAttribute("role", "listitem");
		}
	}
}
