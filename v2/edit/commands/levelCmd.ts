import { EditCommand } from "./editCmd.js";
import { getChildEditor, getEditor } from "../editUtil.js";
import { ele, RANGE } from "../../base/dom.js";
import { EMPTY } from "../../base/util.js";
import { Editor } from "../../base/editor.js";

export class LevelCommand extends EditCommand {
	declare name: "Promote" | "Demote";
	startId: string;
	endId: string;
	exec(range: RANGE): RANGE {
		let editor = this.owner.getControl(this.viewId) as Editor;
		this.startId = getChildEditor(editor, range.startContainer)?.id;
		this.endId = getChildEditor(editor, range.endContainer)?.id;
		this.do(this.name);
		return range;
	}
	protected do(way: "Promote" | "Demote") {
		let start = this.owner.getControl(this.startId) as Editor;
		let end = this.owner.getControl(this.endId) as Editor;
		if (start == end) {
			way == "Promote" ? start.promote() : start.demote();
		} else {
			while (start) {
				way == "Promote" ? start.promote() : start.demote();
				if (start == end) break;
				start = getEditor(ele(start.view).nextElementSibling);
			}
		}

		let range = start.view.ownerDocument.createRange();
		range.setStartBefore(start.view);
		range.setEndAfter(end.view);
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
