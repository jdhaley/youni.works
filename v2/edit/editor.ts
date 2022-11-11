import { Control } from "../base/control.js";
import { ELE } from "../base/dom.js";

export interface Editor extends Control<ELE> {
	id: string;
	/** @deprecated */
	convert?(type: string): void;
}
