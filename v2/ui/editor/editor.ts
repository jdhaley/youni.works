import { Command, CommandBuffer } from "../../base/command.js";
import { content } from "../../base/model.js";
import { Receiver } from "../../base/controller.js";
import { bundle } from "../../base/util.js";

export interface Editable extends Element {
	$controller?: Editor
}

export interface Editor  {
	readonly name: string;
	readonly types: bundle<Editor>;
	readonly model: string;
	readonly owner: Article;
	readonly isContainer: boolean;
	toModel(view: Element, range?: Range, id?: true): content;
	toView(model: content): Element;
	getContentOf(node: Node): Element;
	edit(commandName: string, range: Range, content?: content): Range;
}

export interface Article extends Receiver {
	readonly commands: CommandBuffer<Range>;
	bindView(element: Element): void;
	getElementById(id: string): Element;
	setRange(range: Range, collapse?: boolean): void;
}

export abstract class Edit extends Command<Range> {
	constructor(owner: Article, name: string, viewId: string) {
		super();
		this.owner = owner;
		this.name = name;
		this.timestamp = Date.now();
		this.viewId = viewId;
		owner.commands.add(this);
	}
	owner: Article;
	name: string;
	timestamp: number;
	viewId: string;
}
export function getViewById(owner: Article, id: string) {
	let view = owner.getElementById(id) as Editable;
	if (!view) throw new Error("Can't find view element.");
	if (view.getAttribute("data-item")) return view;
	if (!view.$controller) {
		console.warn("view.type$ missing... binding...");
		owner.bindView(view as any);
		if (!view.$controller) throw new Error("unable to bind missing type$");
	} else {
		view.$controller.getContentOf(view); //checks the view isn't corrupted.
	}
	return view;
}
