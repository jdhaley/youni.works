import { value } from "./model.js";
import { Content, Text, View, ViewType } from "./view.js";
import { Graph, Receiver } from "./control.js";
import { CommandBuffer } from "./command.js";
import { bundle, Extent, Sequence } from "./util.js";

export interface NodeContent<T extends Text> extends Content {
	readonly node: T;
	readonly contents: Sequence<T>
}

/**
 * A ContentView is both a View and Content.
 */
export interface ContentView<T extends Text> extends NodeContent<T>, View {
	/**
	 * The content may be the view itself or another content object.
	 */
	readonly content: NodeContent<T>;
}

export interface Editable<T extends Text, E extends Extent<T>> extends ContentView<T> {
	readonly type: ArticleType<T>;
	id: string;
	edit(commandName: string, extent: E, replacement?: value): E;
	getContent(range?: E): T
}

export interface ArticleType<T extends Text> extends ViewType {
	readonly owner: Article<T>;
	create(value?: value, container?: Content): ContentView<T>;
	control(node: T): ContentView<T>;
}

export interface Article<T extends Text> extends Receiver, Graph<T> {
	af: AF<T>;
	node: T;
	conf: bundle<any>;
	commands: CommandBuffer<Extent<T>>;
	getControl(id: string): ContentView<T>;
	setRange(extent: Extent<T>, collapse?: boolean): void;
	createNode(tag: string): T;
}

export interface AF<T extends Text> {
	types: bundle<ArticleType<T>>;
	unknownType: ArticleType<T>;
}
