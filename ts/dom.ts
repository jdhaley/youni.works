interface Ele extends Element {
	ownerDocument: Doc;
	parentNode: Ele;
	control: EleControl;
}

interface Doc extends Document {
	owner: Owner;
}

class Owner {
	#document: Document;
	#lastId: number = 0;
	get document() {
		return this.#document;
	}
	get view() {
		return this.document.body;
	}
	get location() {
		return this.document.location;
	}
	createElement(name: string, namespace?: string) {
		if (namespace) {
			return this.document.createElementNS(namespace, name);
		} else {
			return this.document.createElement(name);
		}
	}
	createId() {
		return ++this.#lastId;
	}
}

class EleControl extends Sensor {
	#ele: Ele;
	constructor(owner: Owner, conf: any) {
		super(conf.controller);
		this.#ele = <Ele> owner.createElement(conf.nodeName);
		this.#ele.control = this;
	}
	get nodeName() {
		return this.#ele.nodeName;
	};
	get owner(): Owner {
		return this.#ele.ownerDocument.owner;
	}
	get partOf() {
		return this.#ele.parentNode.control;
	}
	get parts() {
		let x: ChildNode;
		const nodes = <NodeListOf<Ele>> this.#ele.childNodes;
		let to = Object.create(null);
		to[Symbol.iterator] = function*() {
			for (let i = 0, len = nodes.length; i < len; i++) {
				let node = nodes[i];
				if (node.control) yield node.control;
			}
		}
		Reflect.defineProperty(this, "parts", {
			value: to
		});
		return to;
	}
	get markup() {
		return this.#ele.innerHTML;
	}
	set markup(markup: string) {
		this.#ele.innerHTML = markup;
	}
	append(control: EleControl) {
		this.#ele.append(control.#ele);
	}
	protected get view(): Element {
		return this.#ele;
	}
}

class Frame extends Owner {
	#window: Window;
	constructor(window: Window) {
		super();
		this.#window = window;
		this.document.owner = this;
	}
	get document(): Doc {
		return <Doc> this.#window.document;
	}
	get activeElement() {
		return this.document.activeElement;
	}
	get selectionRange() {
		let selection = this.#window.getSelection();
		if (selection && selection.rangeCount) {
			return selection.getRangeAt(0);
		}
		return this.document.createRange();
	}
	viewOf(node: Node) {
		while(node) {
			if ((<any> node).control) return (<any> node).control;
			node = node.parentNode;
		}
	}
	viewAt(x: number, y: number) {
		let target = this.document.elementFromPoint(x, y);
		return this.viewOf(target);
	}
}

interface View {
	nodeName: string;
	styles: string;
	controller: Controller<Viewer>;
}

class Viewer extends EleControl implements Part {
	constructor(owner: Frame, v: View) {
		super(owner, v);
		let view = <HTMLElement> this.view;
		if (v.styles) view.className = v.styles;
	}
	get owner(): Frame {
		return <Frame> super.owner;
	}
	get box() {
		return this.view.getBoundingClientRect();
	}
	get styles() {
		let view = <HTMLElement> this.view;
		return view.classList;
	}
	style(name?: string): CSSStyleDeclaration {
		let view = <HTMLElement> this.view;
		return name ? view.classList[name] : view.style;
	}
	size(width: number, height: number) {
		let style = this.style();
		style.width = Math.max(width, 16) + "px";
		style.minWidth = style.width;
		style.height = Math.max(height, 16) + "px";
		style.minHeight = style.height;
	}
	position(x: number, y: number) {
		let style = this.style();
		style.position = "absolute";			
		style.left = x + "px";
		style.top = y + "px";
	}
}

export {View, Viewer, Frame};