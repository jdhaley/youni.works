import {Controller, Signal} from "../base/controller.js";
import {Content, ContentType} from "../base/content.js";

interface Document {
	//createElementNS(namespace, name);
	/** mangle the namespace into the name if needed. */
	createElement(name: string): Element;
}


interface Display {
	// id: string;
	// className: string;
	// title: string;
	// box: DOMRect;
	// styles: Iterable<string>;
	
	getStyle(name?: string): CSSStyleDeclaration;
	size(width: number, height: number): void;
	position(x: number, y: number): void;
}
