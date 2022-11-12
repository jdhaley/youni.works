import { ELE } from "../../base/dom.js";
import { Response } from "../../base/message.js";
import { extend } from "../../base/util.js";
import { Article, Box, Change } from "../../base/control.js";
import { UserEvent } from "../../control/frame.js";

import { CommandBuffer } from "../../base/command.js";
import { Type } from "../../base/type.js";

export default extend(null, {
	open(this: Article<ELE>, res: Response<string>) {
		this.source = res.statusCode == 404 ? [] : JSON.parse(res.body);
		let type = getType(this, res.req.to, this.source);
		this.view = (type.create(this.source)).view as ELE;
		this.view.setAttribute("data-file", res.req.to);
		this.view.setAttribute("contentEditable", "true");	
		this.frame.append(this.view);

		//shapetest.call(this);
	},
	save(this: Article<ELE>, signal: UserEvent | Response<string>) {
		signal.subject = "";
		if (signal instanceof Response) {
			console.log("Saved: ", signal);
			return;
		} else {
			let model = (this.view["$control"] as any).valueOf();
			console.log("Save: ", model);
			this.service.save(this.view.getAttribute("data-file"), JSON.stringify(model, null, 2), this);
			if (this.conf.recordCommands) {
				let tc = {
					source: this.source,
					target: model,
					commands: serializeCommands(this.commands)
				}
				this.service.save("/test" + this.view.getAttribute("data-file"), tc, this);
			}
		}
	},
	undo(this: Article<ELE>, event: UserEvent) {
		event.subject = "";
		let range = this.commands.redo();
		if (range) {
			this.setExtent(range, false);
			let signal = new Change("undo");
			this.send(signal, this.view);
			this.frame.receive(signal);	
		}
	},
	redo(this: Article<ELE>, event: UserEvent) {
		event.subject = "";
		let range = this.commands.redo();
		if (range) {
			this.setExtent(range, false);
			let signal = new Change("undo");
			this.send(signal, this.view);
			this.frame.receive(signal);	
		}
	},
	change(this: Article<ELE>, signal: Change) {
		// console.log("Article changed:", this.commands.peek());
		// signal.direction = "down";
		// this.send(signal, this.node);
		this.frame.receive(signal);
	}
});

function getType(article: Article<ELE>, path: string, data: any): Type<Box<ELE>> {
	path = path.substring(path.lastIndexOf("/") + 1);
	if (path.endsWith(".json")) path = path.substring(0, path.length - 5);
	let typeName = path.indexOf (".") > 0 ? path.substring(path.lastIndexOf(".") + 1) : "";
	if (!typeName && data && typeof data == "object" && data.type$) {
		typeName = data.type$;
	}
	return article.types[typeName] as any || article.defaultType;
}

function serializeCommands(history: CommandBuffer<any>) {
	let out = [];
	for (let command = history.peek(); command; command = command.prior) {
		if (command.prior) out.unshift(command.serialize());
	}
	return out;
}

function shapetest(this: Article<ELE>) {
	// let type = new ViewTypeImpl(this);
	// type.start("shape", {
	// 	prototype: new TextBox(shape, null),
	// 	actions: shape
	// });
	
	// let view = type.create("HELLO THERE") as EditorView;
	// view.content.styles.add("shape");
	// view.position(300, 0);

	// this.frame.view.append(view.node);
}
