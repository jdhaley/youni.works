import { Command, CommandBuffer } from "../../base/command.js";
import { Receiver } from "../../base/controller.js";
import { content } from "../../base/model.js";
import { bundle } from "../../base/util.js";

export interface Editable extends Element {
	$controller?: Editor
	$content: Element;
}

export interface Editor  {
	readonly owner: Article;
	readonly model: string;
	readonly shortcuts: bundle<string>;

	getContentOf(node: Node): Element;
	toView(model: content): Editable
	toModel(view: Editable, range?: Range): content;
	edit(commandName: string, range: Range, content?: content): Range;
}

export interface Article extends Receiver {
	readonly commands: CommandBuffer<Range>;
	//readonly view: Editable;

	getView(viewId: string): Editable;
	_setRange(range: Range): Range;
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
