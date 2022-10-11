import { Command } from "../../base/command.js";
import { Article } from "../../base/editor.js";
import { RANGE } from "../../base/ele.js";

export abstract class Edit extends Command<RANGE> {
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
