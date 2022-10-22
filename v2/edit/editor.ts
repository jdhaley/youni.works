import { contentType, value } from "../base/model.js";
import { DomView, ELE, RANGE } from "../base/dom.js";

import { BoxType } from "../base/box.js";
import { Signal } from "../base/control.js";
import { View } from "../base/view.js";

export interface Editor extends DomView {
	readonly type: BoxType;

	edit(commandName: string, range: RANGE, replacement?: value): RANGE;
	getContent(range?: RANGE): ELE;
}

export interface ItemEditor extends Editor {
	level: number;
	demote(): void;
	promote(): void;
	convert(type: string): void;
}

export class Change implements Signal {
	constructor(command: string, view?: View) {
		this.direction = view ? "up" : "down";
		this.subject = "change";
		this.from = view;
		this.source = view;
		this.commandName = command;
	}
	direction: "up" | "down";
	source: View;
	from: View;
	on: View;
	subject: string;
	commandName: string;
}