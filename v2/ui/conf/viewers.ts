import {Content, List, Record, typeOf, View, Viewer, viewType} from "../../base/model.js";
import { ViewType } from "../../base/editor";

export default {
	text(this: Viewer, model: string): void {
		this.content.textContent =  model || "";
	},
	record(this: Viewer, model: Record): void {
		//view["$at"] = Object.create(null);
		for (let name in this.type.types) {
			let type = this.type.types[name] as ViewType;
			let value = model ? model[name] : null;
			let member = type.view(value);
			member.classList.add("field");
			this.content.append(member);
			//view["$at"][name] = member;
		}
	},
	list(this: Viewer, model: List): void {
		if (model && model[Symbol.iterator]) for (let item of model) {
			let type = this.type as ViewType;
			type = type.types[viewType(item)] || type.owner.unknownType;
			let part = type.view(item);
			this.content.append(part);
		}
	},
	markup(this: Viewer, model: Content[]): void {
		if (model && model[Symbol.iterator]) for (let item of model) {
			let type = this.type as ViewType;
			type = type.types[viewType(item)] || type.owner.unknownType;
			let part = type.view(item);
			this.content.append(part);
		}
	},
	line(this: Viewer, item: Content): void {
		let impl = this.content as Element;
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
