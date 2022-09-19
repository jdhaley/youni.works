import { Type, content, Viewer } from "./model";
import { CommandBuffer } from "./command";
import { bundle } from "./util";

interface Container {
	textContent: string;
}
interface ViewRange {
    readonly collapsed: boolean;
	readonly startContainer: Container;
    readonly startOffset: number;
	readonly endContainer: Container;
    readonly endOffset: number;
	readonly commonAncestorContainer: Container;
}

export interface ViewType extends Type {
	owner: ViewOwner;
	types: bundle<ViewType>;
	toModel(view: Element, extent?: ViewRange): content;
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
