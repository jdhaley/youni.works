import {content} from "../base/model.js";
import { bundle } from "../base/util.js";
import {Display, DisplayType} from "./display.js";

export class Panel extends DisplayType {
	header: DisplayType;
	footer?: DisplayType;
	start(conf: bundle<any>) {
		super.start(conf);
		this.header = new Caption(this)
		this.header.start(conf);
	}
	display(view: Display, model: content): void {
		view.$content = null;
		for (let ele of view.children) {
			if (ele.tagName == "ui-body") {
				view.$content = ele as HTMLElement;
				break;
			}
		}
		if (!view.$content) view.$content = this.owner.createElement("ui-body");
		view.textContent = "";
		if (this.header) view.append(this.header.toView(model));
		view.append(view.$content);
		super.display(view.$content as Display, model);
		if (this.footer) view.append(this.footer.toView(model));
	}
	getContentOf(view: Display): HTMLElement {
		if (!view.$content || view.$content != view.children[1])  {
			console.log("rebuild view");
			this.display(view, undefined);
		}
		return view.$content;
	}
}

export class Table extends Panel {
	rowType: DisplayType;
	start(conf: bundle<any>) {
		super.start(conf);
		if (this.conf.rowType) {
			this.rowType = Object.create(this.types[this.conf.rowType] as DisplayType);
		}
	}
	createHeader(view: Display, model?: content): HTMLElement {
		let header = this.owner.createElement("HEADER");
		let title = this.owner.createElement("div");
		title.textContent = this.conf.title;
		header.append(title);
		let columns = this.owner.createElement("div");
		columns.classList.add("columns");
		header.append(columns);

		header["$at"] = Object.create(null);
		for (let name in this.rowType.types) {
			let col = this.owner.createElement("DIV");
			col.textContent = this.rowType.types[name].conf.title;
			col.dataset.name = name;
			columns.append(col);
			header["$at"][name] = col;
		}
		return header;			
	}
}

export class Row extends Panel {
	start(conf: bundle<any>) {
		super.start(conf);
	}
}

export class Caption extends DisplayType {
	constructor(container: DisplayType) {
		super();
		this.owner = container.owner;
		this.container = container;
	}
	container: DisplayType;
	toView(model: content): Display {
		let header = this.owner.createElement("HEADER") as Display;
		header.$controller = this;
		header.textContent = this.conf.title;
		return header;
	}
}