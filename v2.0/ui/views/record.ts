import {Record} from "../../model.js";
import { CHAR } from "../../util.js";
import {View, ViewType} from "./view.js";

class RecordView extends View {
	constructor() {
		super();
	}
}
customElements.define('ui-record', RecordView);

export class RecordType extends ViewType {
	tag = "ui-record";
	viewContent(view: View, model: Record): void {
		view.textContent = "";
		for (let name in this.types) {
			let type = this.types[name];
			let value = model ? model[name] : null;
			let member = type.toView(value);
			member.dataset.name = type.propertyName;
			view.append(member);
		}
		if (!view.textContent) view.textContent = CHAR.ZWSP;
	}
	toModel(view: View): Record {
		let model = Object.create(null);
		model.type$ = this.name;
		for (let child of this.context.getPartsOf(view)) {
			let type = view.view_type;
			if (type) {
				let value = type.toModel(child);
				if (value) model[type.propertyName] = value;	
			}
		}
		return model;
	}
}
