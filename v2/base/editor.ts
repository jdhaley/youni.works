import { Type, content, Viewer } from "./model";
import { CommandBuffer } from "./command";
import { bundle } from "./util";

export interface ViewType extends Type {
	owner: ViewOwner;
	types: bundle<ViewType>;
	toModel(view: Element, range?: Range): content;
	toView(model: content): EditableView;
	bind(element?: Element): Editor;
}

export interface ViewOwner {
	view: EditableView;
	unknownType: Type;
	commands: CommandBuffer<Range>;
	setRange(range: Range, collapse?: boolean): void;
}

export interface EditableView extends Element {
	$control?: Editor;
}

export interface Editor extends Viewer {
	type: ViewType;
	edit(commandName: string, range: Range, content?: content): Range;
}
