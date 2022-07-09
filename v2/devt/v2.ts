import {ViewOwner, ViewType} from "../base/view.js";

export interface ContentView {
	container?: ContentView;
	content: Iterable<ContentView>;
	textContent: string;
}

export interface View extends ContentView {
	type$: ViewType<View>
	append(content: any): void;
	//header?: View;
	//footer?: View;
}

export abstract class ContentOwner extends ViewOwner<View> {
	getControlOf(value: View): ViewType<View> {
		return value.type$;
	}
	getPartOf(value: ContentView): View {
		return value.container as View;
	}
	getPartsOf(value: ContentView): Iterable<View> {
		return value.content as Iterable<View>
	}
	getTextOf(view: ContentView): string {
		return view.textContent;
	}
	setTextOf(view: ContentView, value: string): void {
		view.textContent = value;
	}
	appendTo(view: View, value: unknown): void {
		view.append(value);
	}
}