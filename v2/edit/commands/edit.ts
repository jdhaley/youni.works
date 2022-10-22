import { Article } from "../../base/box.js";
import { Command } from "../../base/command.js";
import { RANGE } from "../../base/dom.js";

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
