import { Type, content, Viewer, View } from "./model";
import { CommandBuffer } from "./command";
import { bundle } from "./util";

export interface ViewType extends Type {
	owner: ViewOwner;
	types: bundle<ViewType>;
	view(content: content): View;
}

export interface ViewOwner {
	view: EditableView;
	unknownType: ViewType;
	commands: CommandBuffer<Range>;
	setRange(extent: Range, collapse?: boolean): void;
}

export interface EditableView extends Element {
	$control?: Editor;
}

export interface Editor extends Viewer {
	type: ViewType;
	edit(commandName: string, range: Range, content?: content): Range;
}
