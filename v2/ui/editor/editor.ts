import { Command, CommandBuffer } from "../../base/command.js";
import { content } from "../../base/model.js";
import { Receiver } from "../../base/controller.js";
import { bundle } from "../../base/util.js";
import { bindView } from "./util.js";
import { Display } from "../display/display.js";

export interface Editable extends Element {
	$controller?: Editor;
	$control?: Display;
}

export interface Editor  {
	readonly name: string;
	readonly types: bundle<Editor>;
	readonly model: string;
	readonly owner: Article;
	readonly isContainer: boolean;
	toModel(view: Element, range?: Range, id?: true): content;
	toView(model: content): Element;
	bind(view: Editable): void;
	getContentOf(node: Node): Element;
	edit(commandName: string, range: Range, content?: content): Range;
}

export interface Article extends Receiver {
	unknownType: Editor;
	readonly commands: CommandBuffer<Range>;
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
		bindView(view as any);
		if (!view.$controller) throw new Error("unable to bind missing type$");
	} else {
		view.$controller.getContentOf(view); //checks the view isn't corrupted.
	}
	return view;
}
