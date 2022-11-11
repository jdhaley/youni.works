import { Control } from "../base/control.js";
import { ELE, RANGE } from "../base/dom.js";

export interface Editor extends Control<ELE> {
	id: string;
	/** @deprecated */
	convert?(type: string): void;
	exec(commandName: string, extent: RANGE, replacement?: any): RANGE;
}
