import { value } from "../../base/model.js";
import { CHAR } from "../../base/util.js";

import { ViewBox } from "../box.js";

export class TextBox extends ViewBox {
	contentType = "text";
	viewContent(model: value): void {
		if (model instanceof Element) {
			//even with plain text, always use HTML so that the marker is transferred to the view.
			this.content.innerHTML = model.innerHTML;
		} else {
			this.content.textContent = model ? "" + model : "";
		}
	}
	valueOf(range?: Range): value {
		let model = "";
		if (range && !range.intersectsNode(this.content)) return;
		for (let node of (this.content as Element).childNodes) {
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
