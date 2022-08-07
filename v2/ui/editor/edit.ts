import { Command, CommandBuffer } from "../../base/command.js";
import { content } from "../../base/model.js";
import { getView } from "../../base/view.js";
import { Receiver } from "../../base/controller.js";

export function getContent(node: Node | Range): Editable {
	let view = getView(node) as Editable;
	return view?.$controller.getContentOf(view);
}

export interface Editable extends Element {
	$controller?: Editor
}

export interface Editor  {
	readonly owner: Article;
	readonly model: string;

	getContentOf(node: Node): Element;
	toView(model: content): Editable
	toModel(view: Editable, range?: Range): content;
	edit(commandName: string, range: Range, content?: content): Range;
}

export interface Article extends Receiver {
	readonly commands: CommandBuffer<Range>;
	getView(viewId: string): Editable;
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
	before: string;
	after: string;

	undo() {
		//console.log("undo - " + this.name, this["startId"], this["endId"]);
		return this.exec(this.before);
	}
	redo() {
		//console.log("redo - " + this.name, this["startId"], this["endId"]);
		return this.exec(this.after);
	}

	protected abstract exec(markup: string): Range;
}
