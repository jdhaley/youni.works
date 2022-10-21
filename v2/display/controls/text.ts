import { contentType, value } from "../../base/model.js";
import { CHAR } from "../../base/util.js";
import { ele, ELE, RANGE } from "../../base/dom.js";
import { EditorView } from "../editor.js";


export class TextBox extends EditorView {
	viewType = "text";
	viewValue(model: value): void {
		this.content.textContent = model ? "" + model : "";
	}
	viewElement(ele: ELE) {
		//even with plain text, always use HTML so that the marker is transferred to the view.
		this.content.markupContent = ele.innerHTML;
	}
	valueOf(range?: RANGE): value {
		let model = "";
		if (range && !range.intersectsNode(this.content.node)) return;
		for (let node of (this.content.node as ELE).childNodes) {
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
