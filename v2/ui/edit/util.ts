import { View } from "../views/view";

export function getItem(node: Node | Range): View {
	if (node instanceof Range) node = node.commonAncestorContainer;
	while (node) {
		if (node instanceof View) return node;
		node = node.parentElement;
	}
}
