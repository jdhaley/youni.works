// import {CHAR} from "../../base/util.js";
// import {Display, DisplayType} from "../display.js";

// // class TextView extends Display {
// // 	constructor() {
// // 		super();
// // 	}
// // }
// // customElements.define("ui-text", TextView);

// export class TextType extends DisplayType {
// 	tagName = "ui-text";
// 	viewContent(view: Display, model: string): void {
// 		view.textContent = model || CHAR.ZWSP;
// 	}
// 	toModel(view: Display): string {
// 		return view.textContent == CHAR.ZWSP ? "" : view.textContent;
// 	}
// }
