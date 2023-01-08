import { Response } from "../../../base/message.js";
import { Type } from "../../../base/type.js";
import { extend } from "../../../base/util.js";
import { fromCsv } from "../../../transform/fromCSV.js";
import { Change, IArticle } from "../../article.js";
import { UserEvent } from "../../frame.js";

import { Issue, processIssues, albumize } from "./album.js";

export default extend(null, {
	open(this: IArticle, res: Response<string>) {
		this.source = res.statusCode == 404 ? [] : fromCsv(res.body);
		let name = res.req.to;
		name = name.substring(name.lastIndexOf("/") + 1);
		name = name.substring(0, name.lastIndexOf("."));
		let region = name.substring(0, name.indexOf("-"));
		let era = name.substring(name.indexOf("-") + 1);
		let issues = processIssues(region, era, this.source as Issue[]);
		console.log(issues);
		albumize("Canada", issues);
		// let type = getType(this, res.req.to, this.source) as VType;
		// let viewer = type.create();
		// this.view = viewer.view;
		// this.view.setAttribute("data-file", res.req.to);
		// this.view.setAttribute("contentEditable", "true");	
		// this.owner.append(this.view);
		// viewer.draw(this.source);
		// this.owner.send("view", this.view);
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

function getType(article: IArticle, path: string, data: any): Type {
	path = path.substring(path.lastIndexOf("/") + 1);
	if (path.endsWith(".json")) path = path.substring(0, path.length - 5);
	let typeName = path.indexOf (".") > 0 ? path.substring(path.lastIndexOf(".") + 1) : "";
	if (!typeName && data && typeof data == "object" && data.type$) {
		typeName = data.type$;
	}
	return article.forName(typeName) || article.forName("default");
}
