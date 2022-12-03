// import { model, typeOf, value } from "./model.js";
// import { Shape } from "./shape.js";
// import { Receiver, Signal } from "./controller.js";
// import { Type, TypeOwner } from "./type.js";
// import { RemoteFileService } from "./remote.js";
// import { bundle } from "./util.js";
// import { ECTL, ECTX, ETYPE } from "./editing.js";
// import { View, Txt } from "./view.js";
// import { ELE } from "./dom.js";

// // export interface Control extends ECTL {
// // 	readonly type: ControlType;
// // }

// // export interface ControlType extends ETYPE {
// // 	readonly owner: Article;
// // 	create(value?: value, container?: Control): Control

// // 	conf: bundle<any>;
// // 	control(node: ELE): Control;
// // }

// // export interface Box<T> extends Shape, Control {
// // 	header?: View;
// // 	footer?: View;
// // }

// // export interface Article extends ECTX, TypeOwner, Receiver {
// // 	conf: bundle<any>;
// // 	source: value;
// // 	view: ELE;
// // 	defaultType: Type<Control>
// // 	frame: ArticleContext;
// // 	service: RemoteFileService;
// // }

// // export interface ArticleContext extends Receiver {
// // 	location: Location;
// // 	view: ELE;
// // 	selectionRange: Extent<Txt>;

// // 	createNode(name: string): Txt;
// // 	append(node: Txt): void;
// // }

// export interface Edits {
// 	type: string;
// 	source: value;
// 	target: value;
// 	edits: Edit[];
// }

// export interface Edit {
// 	name: string;
// 	viewId: string;
// 	range: {
// 		start: string;
// 		end: string;
// 	}
// 	value: value;
// }

// export class Change implements Signal {
// 	constructor(command: string, view?: View) {
// 		this.direction = view ? "up" : "down";
// 		this.subject = "change";
// 		this.from = view;
// 		this.source = view;
// 		this.commandName = command;
// 	}
// 	direction: "up" | "down";
// 	source: View;
// 	from: View;
// 	on: View;
// 	subject: string;
// 	commandName: string;
// }


// function modelOf(value: any): model {
// 	let type = typeOf(value);
// 	switch (type) {
// 		case "string":
// 		case "number":
// 		case "boolean":
// 		case "date":
// 		case "null":
// 		case "unknown":
// 			return "unit";
// 		case "list":
// 			return "list";
// 	}
// 	return "record";
// }

