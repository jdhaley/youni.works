import {ViewOwner, ViewType} from "./view.js";

interface View {
	type$?: ViewType<View>
	$container?: View;
	$content?: Iterable<View>;
}

export interface ViewElement extends HTMLElement, View {
	type$?: ViewType<ViewElement>
	$container?: ViewElement;
	$content?: Iterable<ViewElement>;
}

export abstract class HtmlOwner extends ViewOwner<ViewElement> {
	getControlOf(view: ViewElement): ViewType<ViewElement> {
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
	getTextOf(view: ViewElement): string {
		return view.textContent;
	}
	setTextOf(view: ViewElement, value: string): void {
		view.textContent = value;
	}
	appendTo(view: ViewElement, value: any): void {
		view.append(value);
	}
	getPartOf(view: ViewElement): ViewElement {
		return view.$container || view.parentElement;
	}
	getPartsOf(view: ViewElement): Iterable<ViewElement> {
		return view.$content || view.children as Iterable<ViewElement>;
	}
}