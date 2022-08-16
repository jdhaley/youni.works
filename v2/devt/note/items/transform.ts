import {Transformer, Transforms} from "./baseTransform.js";
import items from "./items.js";

export {ItemTransformer};

class ItemTransformer implements Transformer<Element, HTMLElement> {
	toViewTypes: Transforms<Node, HTMLElement>;
	fromViewTypes: Transforms<HTMLElement, Element>;
	
	constructor(toView: Transforms<Node, HTMLElement>, fromView: Transforms<HTMLElement, Element>) {
		this.toViewTypes = toView;
		this.fromViewTypes = fromView;
	}
	toView(model: Element): HTMLElement {
		const types = this.toViewTypes;
		console.log("toView() source:", model)
		let target = model.ownerDocument.createElement("ARTICLE");
		target.innerHTML = "<P>"
		types.default.transform(model, target.firstChild as HTMLElement, 0);
		if (target.lastChild?.textContent == "") {
			(target.lastChild as HTMLElement).remove();
		}
		console.log("toView() target:", target);	
		return target;
		}
	fromView(view: HTMLElement): Element {
		const types = this.fromViewTypes;
		console.log("fromView() source:", view)
		let target = view.ownerDocument.createElement("ARTICLE");
		let nodes = view.children; //NOTE: skipping over non-element children.
		for (let i = 0; i < nodes.length; i++) {
			view = nodes[i] as HTMLElement;
			let role = items.getRole(view);
			let transform = types[role] || types["item"];
			transform.transform(view, target);
		}
		console.log("fromView() target:", target)
		return target;
	}
}