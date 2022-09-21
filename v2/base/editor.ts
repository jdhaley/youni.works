import { Type, content, Viewer, View } from "./model.js";
import { CommandBuffer } from "./command.js";
import { bundle } from "./util.js";

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
	contentType: string;
	edit(commandName: string, range: Range, content?: content): Range;
}
