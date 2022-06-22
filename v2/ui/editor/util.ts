import {View} from "../views/view.js";

export function getItem(node: Node | Range): View {
	if (node instanceof Range) node = node.commonAncestorContainer;
	while (node) {
		if (node instanceof View) return node;
		node = node.parentElement;
	}
}

export function replace(range: Range, markup: string) {
	range.deleteContents();
	range.collapse();
	let view = getItem(range);
	let type = view.view_type;
	view = type.owner.createView(type);
	view.innerHTML = markup;
	while (view.firstElementChild) {
		range.insertNode(view.firstElementChild);
		range.collapse();
	}
}