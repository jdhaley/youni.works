import { Command } from "../../../base/command.js";
import { ArticleI } from "../../../base/editor.js";

export abstract class Edit extends Command<Range> {
	constructor(owner: ArticleI, name: string, viewId: string) {
		super();
		this.owner = owner;
		this.name = name;
		this.timestamp = Date.now();
		this.viewId = viewId;
		owner.commands.add(this);
	}
	owner: ArticleI;
	name: string;
	timestamp: number;
	viewId: string;
}
