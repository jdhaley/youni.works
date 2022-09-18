import { Command } from "../../../base/command.js";
import { ViewOwner } from "../../../base/model.js";

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
