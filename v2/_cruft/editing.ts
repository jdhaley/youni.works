// import { CommandBuffer } from "./command";
// import { Signal } from "./controller";
// import { ELE } from "./dom";
// import { value } from "./model";
// import { Extent } from "./util";
// import { Txt, View, ViewType } from "./view";

// export interface ECTL extends View {
// 	readonly id: string;
// 	readonly type: ETYPE;
// 	readonly view: ELE;
// 	readonly content: ELE;

// 	valueOf(filter?: unknown): value;
// 	exec(commandName: string, extent: Extent<unknown>, replacement?: value): void;

// 	level: number;
// 	demote(): void;
// 	promote(): void;
// }
// export interface ETYPE extends ViewType {
// 	readonly owner: ECTX;
// 	name: string;
// 	readonly model: string;
// 	create(value?: value, container?: ECTL): ECTL
// }

// export interface ECTX {
// 	commands: CommandBuffer<Extent<Txt>>;
// 	selectionRange: Extent<Txt>;
// 	getControl(id: string): ECTL;
// 	extentFrom(startPath: string, endPath: string): Extent<Txt>;
// 	sense(signal: Signal | string, on: ELE): void;
// }
