import {Response} from "../../base/message.js";
import {extend} from "../../base/util.js";

import {UserEvent} from "../ui.js";
import {Article, Display} from "../views/display.js";

//import view from "./view.js";

export default extend(null, {
	open(this: Article, res: Response<string>) {
		let model = res.statusCode == 404 ? [] : JSON.parse(res.body);
		this.view = this.type.toView(model) as Display;
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
		let model = this.view.view_model;
		console.log(model);
		this.service.save(this.view.getAttribute("data-file"), JSON.stringify(model, null, 2), this);
	},
	selectAll(this: Article, event: UserEvent) {
		event.subject = "";
		let range = this.frame.selectionRange;
		range.selectNodeContents(this.view)
	}
});
