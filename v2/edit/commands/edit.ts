import { RANGE } from "../../base/dom.js";
import { Article, Edit, Command } from "../../base/editor.js";

export abstract class EditCommand extends Command<RANGE> implements Edit {
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
	declare range: {
		start: string;
		end: string;
	}
	declare value: any;
}