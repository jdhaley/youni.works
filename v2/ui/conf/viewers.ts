import {List, Record, typeOf, ViewType, viewType} from "../../base/model.js";

interface Item {
	type$: string,
	content: string,
	id?: string,
	level?: number
}

export default {
	text(this: ViewType, view: Element, model: string): void {
		view.textContent =  model || "";
	},
	record(this: ViewType, view: Element, model: Record): void {
		view["$at"] = Object.create(null);
		for (let name in this.types) {
			let type = this.types[name];
			let value = model ? model[name] : null;
			let member = type.toView(value);
			member.classList.add("field");
			view.append(member);
			view["$at"][name] = member;
		}
		//if (!view.textContent) view.textContent = CHAR.ZWSP;
	},
	list(this: ViewType, view: Element, model: List): void {
		//view.textContent = "";
		if (model && model[Symbol.iterator]) for (let item of model) {
			let type = this["rowType"] || this.types[viewType(item)] || this.owner.unknownType;
			let part = type.toView(item);
			view.append(part);
		}
		//if (!view.textContent) view.append(CHAR.ZWSP);
	},
	markup(this: ViewType, view: Element, model: Item[]): void {
		if (model && model[Symbol.iterator]) for (let item of model) {
			let type = this["rowType"] || this.types[viewType(item)] || this.owner.unknownType;
			let part = type.toView(item);
			view.append(part);
		}
	//	view.append(this.types["para"].toView({}));
	},
	line(this: ViewType, view: Element, item: Item): void {
		view.innerHTML = "" + (item.content || "");
		if (item.type$ == "heading") {
			view.setAttribute("role", "heading");
		}
		if (item.level) {
			view.setAttribute("aria-level", "" + item.level);
			if (item.type$ == "para") view.setAttribute("role", "listitem");
		}
	}
}
