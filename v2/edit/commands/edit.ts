import { Article, Edit } from "../../base/control.js";
import { Command } from "../../base/command.js";
import { NODE, RANGE } from "../../base/dom.js";

export abstract class EditCommand extends Command<RANGE> implements Edit {
	constructor(owner: Article<NODE>, name: string, viewId: string) {
		super();
		this.owner = owner;
		this.name = name;
		this.timestamp = Date.now();
		this.viewId = viewId;
		owner.commands.add(this);
	}
	owner: Article<NODE>;
	name: string;
	timestamp: number;
	viewId: string;
	declare range: {
		start: string;
		end: string;
	}
	declare value: any;
}