import { content } from "../base/model.js";
import { CHAR } from "../base/util.js";
import { Display, DisplayType, getView } from "./display.js";

export class PanelType extends DisplayType {
	display(view: Display, model: content): void {
		view.textContent = "";
		view.append(this.createHeader(view));
		view.append(this.createContent(view, model));
		if (this.model == "list") {
			view.append(this.createFooter(view));
		}
	}
	createHeader(view: Display, model?: content) {
		let header = this.owner.createElement("header");
		header.textContent = this.conf.title || "";
		return header;
	}
	createContent(view: Display, model?: content) {
		view.$content = this.owner.createElement("div");
		view.$content.classList.add("view");
		this.owner.viewers[this.model].call(this, view.$content, model);
		return view.$content;
	}
	getContentOf(view: Display): HTMLElement {
		if (!view.$content || view.$content != view.children[1])  {
			this.rebuildView(view);
		}
		return view.$content;
	}
	protected rebuildView(view: Display) {
		for (let ele of view.children) {
			if (ele.classList.contains("view")) {
				view.$content = ele as HTMLElement;
				break;
			}
		}
		view.textContent = "";
		view.append(this.createHeader(view));
		view.append(view.$content || this.createContent(view, undefined));
	}
	createFooter(view: Display, model?: content) {
		let footer = this.owner.createElement("footer");
		footer.textContent = CHAR.ZWSP;
		return footer;
	}
}

export class Table extends PanelType {
	rowType: DisplayType;
	start() {
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

export class Row extends PanelType {
	start() {
	}
}
