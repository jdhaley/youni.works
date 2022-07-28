import { content, List, Record } from "../../base/model.js";
import { ElementType, ViewType } from "../../base/view.js";
import { CHAR, EMPTY } from "../../base/util.js";

export default {
	list(this: ElementType, view: Element): List {
		let model: content[];
		for (let part of this.getContentOf(view).children) {
			let type = this.owner.getControlOf(part);
			let value = type?.toModel(part);
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
	record(this: ElementType, view: Element): Record {
		let model: Record;
		for (let part of this.getContentOf(view).children) {
			let type = this.owner.getControlOf(part);
			let value = type?.toModel(part);
			if (value) {
				if (!model) {
					model = Object.create(null);
					model.type$ = this.name;
				}
				model[type.propertyName] = value;
			}
		}
		return model;
	},
	text(this: ElementType, view: Element): string {
		let text = view.textContent;
		return text == CHAR.ZWSP ? "" : text;
	}
}
