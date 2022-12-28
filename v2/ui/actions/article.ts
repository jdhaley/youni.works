import { ViewType } from "../../base/viewer.js";
import { RANGE } from "../../base/dom.js";
import { Response } from "../../base/message.js";
import { extend } from "../../base/util.js";
import { CommandBuffer } from "../../base/command.js";

import { UserEvent } from "../frame.js";
import { Change, IArticle } from "../article.js";

export default extend(null, {
	open(this: IArticle, res: Response<string>) {
		this.source = res.statusCode == 404 ? [] : JSON.parse(res.body);
		let type = getType(this, res.req.to, this.source);
		let viewer = type.create();
		this.view = viewer.view;
		this.view.setAttribute("data-file", res.req.to);
		this.view.setAttribute("contentEditable", "true");	
		this.owner.append(this.view);
		viewer.draw(this.source);
		this.owner.send("view", this.view);
	},
	save(this: IArticle, signal: UserEvent | Response<string>) {
		signal.subject = "";
		if (signal instanceof Response) {
			console.log("Saved: ", signal);
			return;
		} else {
			let model = (this.view["$control"] as any).valueOf();
			console.log("Save: ", model);
			this.service.save(this.view.getAttribute("data-file"), JSON.stringify(model, null, 2), this);
			if (this.recordCommands) {
				let tc = {
					source: this.source,
					target: model,
					commands: serializeCommands(this.commands)
				}
				this.service.save("/test" + this.view.getAttribute("data-file"), tc, this);
			}
		}
	},
	change(this: IArticle, signal: Change) {
		// console.log("Article changed:", this.commands.peek());
		// signal.direction = "down";
		// this.send(signal, this.node);
		this.owner.receive(signal);
	},
	undo(this: IArticle, event: UserEvent) {
		event.subject = "";
		let range = this.commands.undo();
		if (range) this.selectionRange = range;
		this.receive(new Change("undo"));
	},
	redo(this: IArticle, event: UserEvent) {
		event.subject = "";
		let range = this.commands.redo();
		if (range) this.selectionRange = range;
		this.receive(new Change("redo"));
	}
});

function getType(article: IArticle, path: string, data: any): ViewType {
	path = path.substring(path.lastIndexOf("/") + 1);
	if (path.endsWith(".json")) path = path.substring(0, path.length - 5);
	let typeName = path.indexOf (".") > 0 ? path.substring(path.lastIndexOf(".") + 1) : "";
	if (!typeName && data && typeof data == "object" && data.type$) {
		typeName = data.type$;
	}
	return article.forName(typeName) || article.forName("default");
}

function serializeCommands(history: CommandBuffer<RANGE>) {
	let out = [];
	for (let command = history.peek(); command; command = command.prior) {
		if (command.prior) out.unshift(command.serialize());
	}
	return out;
}
