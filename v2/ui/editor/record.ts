import {Record} from "../../base/model.js";

import {Article, Edit, mark, EditElement, EditType, getView, toView} from "./edit.js";
import {Frame} from "../ui.js";

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
		if (view.view_type.model == "record") {
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
		return selectContents(this.owner.frame, this.viewId);
	}
	do(range: Range, record: Record) {
		let view = getView(range);
		startEdit(this, range);
		range.deleteContents();
		let model = view.type$.toModel(view) as Record;
		merge(model, record);
		let x = view.type$.toView(model);
		this.after = x.innerHTML;
		this.exec(this.after);
	}
}

function merge(base: Record, ext: Record) {
	for (let name in ext) {
		switch (typeof base[name]) {
			case "string":
				base[name] = "" + base[name] + ext[name];
				break;
		}
	}
}
export function selectContents(owner: Frame, contextId: string) {
	let context = owner.getElementById(contextId);
	if (!context) throw new Error("Can't find context element.");

	let range = owner.createRange();
	range.selectNodeContents(context);
	return range;
}

function startEdit(cmd: RecordCommand, range: Range) {
	//Mark the actual range.
	mark(range);
	
	range = selectContents(cmd.owner.frame, cmd.viewId);
	cmd.before = toView(range).innerHTML;	
}
