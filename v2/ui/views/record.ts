import {View, ViewCommand, ViewOwner, ViewType} from "./view.js";
import {content, Record} from "../../base/model.js";
import {CHAR} from "../../base/util.js";
import { getItem, mark, markup } from "../editor/util.js";
import { Frame } from "../ui.js";

class RecordView extends View {
	constructor() {
		super();
	}
}
customElements.define("ui-record", RecordView);

export class RecordType extends ViewType {
	tag = "ui-record";
	viewContent(view: View, model: Record): void {
		view.textContent = "";
		for (let name in this.types) {
			let type = this.types[name];
			let value = model ? model[name] : null;
			let member = type.toView(value as content);
			member.dataset.name = type.propertyName;
			view.append(member);
		}
		if (!view.textContent) view.textContent = CHAR.ZWSP;
	}
	toModel(view: View): Record {
		let model = Object.create(null);
		model.type$ = this.name;
		for (let child of this.owner.getPartsOf(view)) {
			let type = child.view_type;
			if (type) {
				let value = type.toModel(child);
				if (value) model[type.propertyName] = value;	
			}
		}
		return model;
	}
	edit(commandName: string, range: Range, markup?: string): Range {
		let view = getItem(range);
		if (view.view_type instanceof RecordType) {
			let cmd = new RecordCommand(this.owner, commandName, view);
			cmd.do(range, markup || "");
		} else {
			console.error("Invalid range for edit.");
		}
		return null;
	}
}

class RecordCommand extends ViewCommand {
	constructor(owner: ViewOwner, name: string, view: View) {
		super(owner, name, view);
	}
	protected getRange(): Range {
		return selectContents(this.owner.owner, this.viewId);
	}
	do(range: Range, markup: string) {
		startEdit(this, range);
		this.after = markup;
		this.exec(markup);
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
	mark(range);
	/*
	Expand the range to encompass the whole start/end items or markers (when 
	a marker is a direct descendent of the list).
	*/
	let ctx = cmd.owner.owner.getElementById(cmd.viewId);
	range.selectNodeContents(ctx);

	//Capture the before image for undo.
	cmd.before = markup(range);	
}
