import {View} from "../../base/view.js";
import {CHAR} from "../../base/util.js";
import {BaseType} from "./view.js";

class TextView extends View {
	constructor() {
		super();
	}
}
customElements.define("ui-text", TextView);

export class TextType extends BaseType {
	tag = "ui-text";
	viewContent(view: View, model: string): void {
		view.textContent = model || CHAR.ZWSP;
	}
	toModel(view: View): string {
		return view.textContent == CHAR.ZWSP ? "" : view.textContent;
	}
}
