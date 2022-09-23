import {Response} from "../../base/message.js";
import {DisplayOwner, DisplayType} from "../display/view.js";

import {start} from "../../base/type.js";
import {extend} from "../../base/util.js";

import {UserEvent} from "../ui.js";

export default extend(null, {
	open(this: DisplayOwner, res: Response<string>) {
		start(this);
		let model = res.statusCode == 404 ? [] : JSON.parse(res.body);
		let type = getType(this, res.req.to, model);
		this.node = type.view(model).node;
		this.node.setAttribute("data-file", res.req.to);
		this.node.setAttribute("contentEditable", "true");	
		this.frame.view.append(this.node);

		shapetest.call(this);
	},
	save(this: DisplayOwner, signal: UserEvent | Response<string>) {
		signal.subject = "";
		if (signal instanceof Response) {
			console.log("Saved: ", signal);
			return;
		} else {
			let model = (this.node["$control"] as any).contentOf();
			console.log("Save: ", model);
			this.service.save(this.node.getAttribute("data-file"), JSON.stringify(model, null, 2), this);	
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
	return article.types[typeName] as any || article.type;
}

import shape from "./shape.js";
import { TextEditor } from "../editor/controls/text.js";
function shapetest(this: DisplayOwner) {
	let type = new DisplayType(this);
	type.start("shape", {
		prototype: new TextEditor(shape),
		actions: shape
	});
	
	let viewer = type.view("HELLO THERE");
	viewer.content.classList.add("shape");
	viewer.position(0, 0);

	this.frame.view.append(viewer.node);
}
