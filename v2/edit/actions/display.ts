import {Response} from "../../base/message.js";
import {ViewTypeImpl, EditorView} from "../../display/view.js";

import {extend} from "../../base/util.js";

import {Display, UserEvent} from "../../ui/ui.js";

export default extend(null, {
	open(this: Display, res: Response<string>) {
		let model = res.statusCode == 404 ? [] : JSON.parse(res.body);
		let type = getType(this, res.req.to, model);
		this.node = type.create(model).node as ELE;
		this.node.setAttribute("data-file", res.req.to);
		this.node.setAttribute("contentEditable", "true");	
		this.frame.view.append(this.node);

		//shapetest.call(this);
	},
	save(this: Display, signal: UserEvent | Response<string>) {
		signal.subject = "";
		if (signal instanceof Response) {
			console.log("Saved: ", signal);
			return;
		} else {
			let model = (this.node["$control"] as any).valueOf();
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
		// console.log("Article changed:", this.commands.peek());
		// signal.direction = "down";
		// this.send(signal, this.node);
		this.frame.receive(signal);
	}
});

function getType(article: Display, path: string, data: any): ViewTypeImpl {
	path = path.substring(path.lastIndexOf("/") + 1);
	if (path.endsWith(".json")) path = path.substring(0, path.length - 5);
	let typeName = path.indexOf (".") > 0 ? path.substring(path.lastIndexOf(".") + 1) : "";
	if (!typeName && data && typeof data == "object" && data.type$) {
		typeName = data.type$;
	}
	return article.types[typeName] as any || article.type;
}

import shape from "./shape.js";
import { TextBox } from "../../display/controls/text.js";
import { ELE } from "../../base/dom.js";
import { Change } from "../../display/FROMVIEW.js";

function shapetest(this: Display) {
	let type = new ViewTypeImpl(this);
	type.start("shape", {
		prototype: new TextBox(shape, null),
		actions: shape
	});
	
	let view = type.create("HELLO THERE") as EditorView;
	view.content.styles.add("shape");
	view.position(300, 0);

	this.frame.view.append(view.node);
}
