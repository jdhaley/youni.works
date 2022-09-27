import { Edit } from "./edit.js";
import { getChildEditor, getView } from "../util.js";
import { LineEditor } from "../controls/line.js";

export class LevelCommand extends Edit {
	declare name: "Promote" | "Demote";
	startId: string;
	endId: string;
	exec(range: Range): Range {
		let editor = this.owner.getControl(this.viewId);
		this.startId = getChildEditor(editor, range.startContainer)?.node.id;
		this.endId = getChildEditor(editor, range.endContainer)?.node.id;
		this.do(this.name);
		console.log(this);
		return range;
	}
	protected do(way: "Promote" | "Demote") {
		let start = this.owner.getControl(this.startId) as LineEditor;
		let end = this.owner.getControl(this.endId) as LineEditor;
		if (start == end) {
			way == "Promote" ? start.promote() : start.demote();
		} else {
			while (start) {
				way == "Promote" ? start.promote() : start.demote();
				if (start == end) break;
				start = getView(start.node.nextElementSibling) as LineEditor;
			}
		}

		let range = start.node.ownerDocument.createRange();
		range.setStartBefore(start.node);
		range.setEndAfter(end.node);
		return range;
	}
	undo() {
		return this.do(this.name == "Promote" ? "Demote" : "Promote");
	}
	redo() {
		return this.do(this.name);
	}
}
