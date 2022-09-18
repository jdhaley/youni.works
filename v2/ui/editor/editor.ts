import { Command } from "../../base/command.js";
import { content, View, ViewOwner, ViewType } from "../../base/model.js";
import { bindView } from "./util.js";


export interface Editable extends Element {
	$controller?: Editor;
	$control?: EditableView;
}
export interface EditableView extends View {
	type: Editor;
	edit(commandName: string, range: Range, content?: content): Range;
}
export interface Editor extends ViewType {
	bind(view: Editable): void;
	getContentOf(node: Node): Element;
	edit(commandName: string, range: Range, content?: content): Range;
}

export abstract class Edit extends Command<Range> {
	constructor(owner: ViewOwner, name: string, viewId: string) {
		super();
		this.owner = owner;
		this.name = name;
		this.timestamp = Date.now();
		this.viewId = viewId;
		owner.commands.add(this);
	}
	owner: ViewOwner;
	name: string;
	timestamp: number;
	viewId: string;
}
export function getViewById(owner: ViewOwner, id: string) {
	let view = owner.getElementById(id) as Editable;
	if (!view) throw new Error("Can't find view element.");
	if (view.getAttribute("data-item")) return view;
	if (!view.$controller) {
		console.warn("view.type$ missing... binding...");
		bindView(view as any);
		if (!view.$controller) throw new Error("unable to bind missing type$");
	} else {
		view.$controller.getContentOf(view); //checks the view isn't corrupted.
	}
	return view;
}
