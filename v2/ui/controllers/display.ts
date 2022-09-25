import {Response} from "../../base/message.js";
import {ViewType, ViewBox} from "../../box/view.js";

import {start} from "../../base/type.js";
import {extend} from "../../base/util.js";

import {Display, UserEvent} from "../ui.js";

export default extend(null, {
	open(this: Display, res: Response<string>) {
		let model = res.statusCode == 404 ? [] : JSON.parse(res.body);
		let type = getType(this, res.req.to, model);
		this.node = (type.view(model) as ViewBox).node;
		this.node.setAttribute("data-file", res.req.to);
		this.node.setAttribute("contentEditable", "true");	
		this.frame.view.append(this.node);

		shapetest.call(this);
	},
	save(this: Display, signal: UserEvent | Response<string>) {
		signal.subject = "";
		if (signal instanceof Response) {
			console.log("Saved: ", signal);
			return;
		} else {
			let model = (this.node["$control"] as any).contentOf();
			console.log("Save: ", model);
			this.service.save(this.node.getAttribute("data-file"), JSON.stringify(model, null, 2), this);	
		}
	},
	undo(this: Display, event: UserEvent) {
		event.subject = "";
		let range = this.commands.redo();
		if (range) {
			this.setRange(range, false);
			let signal = new Change("undo");
			this.send(signal, this.node);
			this.frame.receive(signal);	
		}
	},
	redo(this: Display, event: UserEvent) {
		event.subject = "";
		let range = this.commands.redo();
		if (range) {
			this.setRange(range, false);
			let signal = new Change("undo");
			this.send(signal, this.node);
			this.frame.receive(signal);	
		}
	},
	change(this: Display, signal: Change) {
		console.log("article changed, sending message.");
		signal.direction = "down";
		this.send(signal, this.node);
		this.frame.receive(signal);
	}
});

function getType(article: Display, path: string, data: any): ViewType {
	path = path.substring(path.lastIndexOf("/") + 1);
	if (path.endsWith(".json")) path = path.substring(0, path.length - 5);
	let typeName = path.indexOf (".") > 0 ? path.substring(path.lastIndexOf(".") + 1) : "";
	if (!typeName && data && typeof data == "object" && data.type$) {
		typeName = data.type$;
	}
	return article.types[typeName] as any || article.type;
}

import shape from "./shape.js";
import { TextEditor } from "../../editor/controls/text.js";
import { Change, EditorType } from "../../box/editor.js";

function shapetest(this: Display) {
	let type = new EditorType(this);
	type.start("shape", {
		prototype: new TextEditor(shape),
		actions: shape
	});
	
	let viewer = type.view("HELLO THERE") as unknown as ViewBox;
	viewer.content.classList.add("shape");
	viewer.position(300, 0);

	this.frame.view.append(viewer.node);
}
