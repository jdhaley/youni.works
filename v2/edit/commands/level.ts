import { Edit } from "./edit.js";
import { getChildEditor, getEditor } from "../util.js";
import { ele, RANGE } from "../../base/dom.js";
import { Editor, TreeItem } from "../editor.js";
import { EMPTY } from "../../base/util.js";

export class LevelCommand extends Edit {
	declare name: "Promote" | "Demote";
	startId: string;
	endId: string;
	exec(range: RANGE): RANGE {
		let editor = this.owner.getControl(this.viewId) as Editor;
		this.startId = getChildEditor(editor, range.startContainer)?.id;
		this.endId = getChildEditor(editor, range.endContainer)?.id;
		this.do(this.name);
		console.log(this);
		return range;
	}
	protected do(way: "Promote" | "Demote") {
		let start = this.owner.getControl(this.startId) as TreeItem;
		let end = this.owner.getControl(this.endId) as any as TreeItem;
		if (start == end) {
			way == "Promote" ? start.promote() : start.demote();
		} else {
			while (start) {
				way == "Promote" ? start.promote() : start.demote();
				if (start == end) break;
				start = getEditor(ele(start.node).nextElementSibling) as any as TreeItem;
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
	serialize() {
		return EMPTY.object;
	}
}
