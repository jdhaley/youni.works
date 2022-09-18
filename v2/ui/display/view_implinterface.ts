// import { CommandBuffer } from "../../base/command.js";
// import { Actions, Receiver, Signal } from "../../base/controller.js";
// import { content, Type, View } from "../../base/model.js";
// import { RemoteFileService } from "../../base/remote.js";
// import { bundle } from "../../base/util.js";

// import { Frame } from "../ui.js";



// interface _ControlTypeOwner<V> extends Receiver {
// 	//base Owner...
// 	actions: Actions;
// 	getControlOf(value: V): Receiver;
// 	getPartOf(value: V): V;
// 	getPartsOf(value: V): Iterable<V>;
	
// 	send(msg: Signal | string, to: V): void;
// 	sense(evt: Signal | string, on: V): void;

// 	//Type Owner...
// 	types: bundle<Type>;
// 	unknownType: Type;
// }

// interface _EditorOwner {
// 	unknownType: Type;
// 	commands: CommandBuffer<Range>;
// 	getElementById(id: string): Element;
// 	setRange(range: Range, collapse?: boolean): void;	
// }

// // type viewer = (this: View, model: content) => void;
// // type modeller = (this: View) => content;
// // type editor = (this: View, commandName: string, range: Range, content?: content) => Range;

// interface ViewType extends Type, Receiver {
// 	owner: ViewOwner;
// 	// conf: bundle<any>;
// 	types: bundle<ViewType>;

// 	// prototype?: View;

// 	// createView(): Element;
// 	// getContentOf(view: Element): Element;
// 	toModel(view: Element, range?: Range): content;
// 	toView(model: content): Element
// 	// viewContent(view: Element, model: content): void;
// 	// actions: Actions;

// 	// createView(): View;
// 	// getContentOf(view: View): any;
// 	// toModel(view: View): content;
// 	// toView(model: content): View
// 	// viewContent(view: View, model: content): void;
// }
// interface ViewOwner extends /*_ControlTypeOwner<Element>,*/ _EditorOwner {
// 	getControlOf(value: Element): ViewType;

// 	// viewers: bundle<viewer>;
// 	// modellers: bundle<modeller>;
// 	// editors: bundle<editor>;

// 	// type: ViewType;
// 	// view: Element; //View;

// 	// service: RemoteFileService;
// 	// frame: Frame;

// 	// createElement(tag: string): Element;
// }
