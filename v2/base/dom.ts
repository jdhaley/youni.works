import {ViewOwner, ViewType} from "./view.js";

export abstract class HtmlOwner extends ViewOwner<HTMLElement> {
	getControlOf(view: HTMLElement): ViewType<HTMLElement> {
		let type = view["type$"];
		if (!type) {
			type = this.unknownType;
			let parent = this.getPartOf(view);
			if (parent) {
				type = this.getControlOf(parent);
				type = type?.types[view.dataset.name || view.dataset.type] || this.unknownType;
			}
			view["type$"] = type;
		}
		return type;
	}
	getTextOf(view: HTMLElement): string {
		return view.textContent;
	}
	setTextOf(view: HTMLElement, value: string): void {
		view.textContent = value;
	}
	appendTo(view: HTMLElement, value: any): void {
		view.append(value);
	}
	getPartOf(view: HTMLElement): HTMLElement {
		return view.parentElement;
	}
	getPartsOf(view: HTMLElement): Iterable<HTMLElement> {
		return view.children as Iterable<HTMLElement>;
	}
}