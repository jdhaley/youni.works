import { CHAR } from "../../base/util.js";
import { ELE, RANGE } from "../../base/dom.js";
import { Viewbox } from "./box.js";

export class TextBox extends Viewbox {
	viewType = "text";
	viewValue(model: unknown): void {
		this.content.textContent = model ? "" + model : "";
	}
	viewElement(ele: ELE) {
		//even with plain text, always use HTML so that the marker is transferred to the view.
		this.content.innerHTML = ele.innerHTML;
	}
	valueOf(range?: RANGE): unknown {
		let model = "";
		if (range && !range.intersectsNode(this.content)) return;
		for (let node of (this.content).childNodes) {
			if (node == range?.startContainer && node == range?.endContainer) {
				model += node.textContent.substring(range.startOffset, range.endOffset);
			} else if (node == range?.startContainer) {
				model += node.textContent.substring(range.startOffset);
			} else if (node == range?.endContainer) {
				model += node.textContent.substring(0, range.endOffset);
			} else {
				model += node.textContent;
			}
		}
		model = model.replace(CHAR.ZWSP, "");
		model = model.replace(CHAR.NBSP, " ");
		model = model.trim();
		return model;			
	}
}
