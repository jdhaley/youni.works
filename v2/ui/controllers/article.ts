import {Response} from "../../base/message.js";
import { Type } from "../../base/model.js";
import {extend} from "../../base/util.js";
import {Article} from "../article.js";

import {UserEvent} from "../ui.js";


export default extend(null, {
	open(this: Article, res: Response<string>) {
		let model = res.statusCode == 404 ? [] : JSON.parse(res.body);
		let type = getType(this, res.req.to, model);
		this.view = type.toView(model);
		this.view.setAttribute("data-file", res.req.to);
		this.view.setAttribute("contentEditable", "true");	
		this.frame.view.append(this.view);
	},
	save(this: Article, signal: UserEvent | Response<string>) {
		signal.subject = "";
		if (signal instanceof Response) {
			console.log("Saved: ", signal);
			return;
		}
		this.save();
	},
	// selectAll(this: Article, event: UserEvent) {
	// 	event.subject = "";
	// 	let range = this.frame.selectionRange;
	// 	range.selectNodeContents(this.view)
	// }
});

function getType(article: Article, path: string, data: any) {
	path = path.substring(path.lastIndexOf("/") + 1);
	if (path.endsWith(".json")) path = path.substring(0, path.length - 5);
	let typeName = path.indexOf (".") > 0 ? path.substring(path.lastIndexOf(".") + 1) : "";
	if (!typeName && data && typeof data == "object" && data.type$) {
		typeName = data.type$;
	}
	return article.types[typeName] || article.types[article.conf.type];
}