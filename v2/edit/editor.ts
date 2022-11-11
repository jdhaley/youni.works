import { Component } from "../base/component.js";
import { ELE } from "../base/dom.js";

export interface Editor extends Component<ELE> {
	id: string;
	/** @deprecated */
	convert?(type: string): void;
}
