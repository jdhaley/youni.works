import {Response} from "../../base/message.js";
import {extend} from "../../base/util.js";
import {DisplayOwner, DisplayType} from "../display.js";

import {UserEvent} from "../ui.js";


export default extend(null, {
	open(this: DisplayOwner, res: Response<string>) {
		let model = res.statusCode == 404 ? [] : JSON.parse(res.body);
		let type = getType(this, res.req.to, model);
		this.view = type.toView(model);
		this.view.setAttribute("data-file", res.req.to);
		this.view.setAttribute("contentEditable", "true");	
		this.frame.view.append(this.view);
	},
	save(this: DisplayOwner, signal: UserEvent | Response<string>) {
		signal.subject = "";
		if (signal instanceof Response) {
			console.log("Saved: ", signal);
			return;
		} else {
			let controller = this.view["$controller"];
			let model = controller?.toModel(this.view);
			console.log("Save: ", model);
			this.service.save(this.view.getAttribute("data-file"), JSON.stringify(model, null, 2), this);	
		}
	}
});

function getType(article: DisplayOwner, path: string, data: any): DisplayType {
	path = path.substring(path.lastIndexOf("/") + 1);
	if (path.endsWith(".json")) path = path.substring(0, path.length - 5);
	let typeName = path.indexOf (".") > 0 ? path.substring(path.lastIndexOf(".") + 1) : "";
	if (!typeName && data && typeof data == "object" && data.type$) {
		typeName = data.type$;
	}
	return article.types[typeName] as DisplayType || article.type;
}