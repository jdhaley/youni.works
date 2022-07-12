import {Record} from "../../base/model.js";
import {getView} from "../../base/display.js";

import {Article, Edit, mark, EditType, EditElement, unmark, deleteText} from "./edit.js";

class RecordView extends EditElement {
	constructor() {
		super();
	}
}
customElements.define("ui-record", RecordView);

export class RecordEditor extends EditType {
	readonly model = "record";
	readonly tagName = "ui-record";

	edit(commandName: string, range: Range, record: Record): Range {
		let view = getView(range);
		if (view.type$.model == "record") {
			let cmd = new RecordCommand(this.owner, commandName, view.id);
			cmd.do(range, record);
		} else {
			debugger;
			console.error("Invalid range for edit.");
		}
		return null;
	}
}

class RecordCommand extends Edit {
	constructor(owner: Article, name: string, viewId: string) {
		super(owner, name, viewId);
	}
	protected getRange(): Range {
		let context = this.owner.frame.getElementById(this.viewId);
		if (!context) throw new Error("Can't find context element.");
		let range = this.owner.frame.createRange();
		range.selectNodeContents(context);
		return range;
	}
	do(range: Range, record: Record) {
		let view = getView(range);
		mark(range);
		this.before = getView(range).innerHTML;

		deleteText(range);
		this.after = view.innerHTML;

		unmark(range);	
		range.collapse();
	}
}

// function merge(base: Record, ext: Record) {
// 	for (let name in ext) {
// 		switch (typeof base[name]) {
// 			case "string":
// 				base[name] = "" + base[name] + ext[name];
// 				break;
// 		}
// 	}
// }
