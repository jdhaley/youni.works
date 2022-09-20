import { Type, content, Viewer, ViewRange } from "./model";
import { CommandBuffer } from "./command";
import { bundle } from "./util";

export interface ViewType extends Type {
	owner: ViewOwner;
	types: bundle<ViewType>;
	toView(model: content): EditableView;
	bind(element?: Element): Editor;
}

export interface ViewOwner {
	view: EditableView;
	unknownType: Type;
	commands: CommandBuffer<ViewRange>;
	setRange(extent: ViewRange, collapse?: boolean): void;
}

export interface EditableView extends Element {
	$control?: Editor;
}

export interface Editor extends Viewer {
	type: ViewType;
	edit(commandName: string, range: Range, content?: content): Range;
}
