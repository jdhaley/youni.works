import {content} from "../base/model.js";
import { bundle } from "../base/util.js";
import {Display, DisplayType} from "./display.js";

export class Panel extends DisplayType {
	header?: DisplayType;
	content: DisplayType;
	footer?: DisplayType;
	start(conf: bundle<any>) {
		super.start(conf);
	}
	display(view: Display, model: content): void {
		return super.display(view, model);
		view.textContent = "";
		if (this.header) view.append(this.header.toView(model));
		view.append(this.content.toView(model));
		view.$content = view.children[1] as HTMLElement;
		view.$content.classList.add("view");
		if (this.footer) view.append(this.footer.toView(model));
	}
	getContentOf(view: Display): HTMLElement {
		if (!view.$content || view.$content != view.children[1])  {
			this.rebuildView(view);
		}
		return view.$content;
	}
	protected rebuildView(view: Display) {
		// //TODO need to review & improve this method.

		// for (let ele of view.children) {
		// 	if (ele.classList.contains("view")) {

		// 		view.$content = ele as HTMLElement;
		// 		break;
		// 	}
		// }
		// view.textContent = "";
		// view.append(this.header.toView(undefined));
		// view.append(view.$content || this.content.toView(undefined));
		// view.$content = view.children[1] as HTMLElement;
		// view.$content.classList.add("view");
		// if (this.footer) view.append(this.footer.toView(undefined));
	}
}

export class Table extends Panel {
	rowType: DisplayType;
	start(conf: bundle<any>) {
		super.start(conf);
		this.rowType = Object.create(this.types[this.conf.rowType] as DisplayType);
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
	start() {
	}
}

export class Caption extends DisplayType {
	title: string;
	toView(model: content): Display {
		let header = this.owner.createElement("HEADER") as Display;
		header.$controller = this;
		header.textContent = this.title;
		return header;
	}
}