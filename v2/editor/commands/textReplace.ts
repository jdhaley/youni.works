import { value } from "../../base/model.js";

import { Replace } from "./replace.js";
import { getEditor, mark, unmark } from "../util.js";

export class TextReplace extends Replace {
	exec(range: Range, text: string): Range {
		mark(range);
		let content = getEditor(range).content;
		if (!content) return;
		this.before = content.innerHTML;	
		range.deleteContents();
		if (text) {
			let ins = content.ownerDocument.createTextNode(text);
			range.insertNode(ins);
		}
		this.after = content.innerHTML;
		return unmark(range);	
	}
	protected execBefore(range: Range): void {
		throw new Error("Method not implemented.");		
	}
	protected execReplace(range: Range, content: value): Range {
		throw new Error("Method not implemented.");
	}
	protected execAfter(range: Range): Range {
		throw new Error("Method not implemented.");		
	}
	protected getOuterRange(range: Range): Range {
		range = range.cloneRange();
		range.selectNodeContents(getEditor(range).content);
		return range;
	}
}
