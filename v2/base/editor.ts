import { Type, content, Viewer } from "./model";
import { CommandBuffer } from "./command";
import { bundle } from "./util";

export interface ViewType extends Type {
	owner: ViewOwner;
	types: bundle<ViewType>;
	toModel(view: Element, range?: Range): content;
	toView(model: content): Editable;
	bind(element?: Element): EditableView;
}
/** View owner is the owner type for Editors. */

export interface ViewOwner {
	unknownType: Type;
	commands: CommandBuffer<Range>;
	getElementById(id: string): Element;
	setRange(range: Range, collapse?: boolean): void;
}

export interface Editable extends Element {
	$control?: EditableView;
}

export interface EditableView extends Viewer {
	type: ViewType;
	edit(commandName: string, range: Range, content?: content): Range;
}
