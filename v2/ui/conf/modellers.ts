import { content, List, Record } from "../../base/model.js";
import { ViewType } from "../../base/view.js";
import { CHAR, EMPTY } from "../../base/util.js";

export default {
	list(this: ViewType<unknown>, view: unknown): List {
		let model: content[];
		let parts = this.getPartsOf(view) || EMPTY.array;
		//console.debug("Parts:", parts, view);
		for (let part of parts) {
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
	record(this: ViewType<unknown>, view: unknown): Record {
		let model: Record;
		for (let part of this.getPartsOf(view)) {
			let type = this.owner.getControlOf(part) || this.owner.unknownType;
			let value = type.toModel(part);
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
	text(this: ViewType<unknown>, view: unknown): string {
		let text = this.getTextOf(view);
		return text == CHAR.ZWSP ? "" : text;
	}
}
