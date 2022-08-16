export interface Owner {
	document: Document;
	selectionRange: Range;
	createNodes(source: string | Range): Node[];
	getId(node: Node): string;
	markup(range: Range): string;
}

export default {
	getOwner(node: Node | Range): Owner {
//		return Owner.of(node);
		return undefined;
	},
	getItems(node: Node | Range): Element {
		if (node instanceof Range) node = node.commonAncestorContainer;
		while (node) {
			if (node["$editor"])  return node as Element;
			node = node.parentNode;
		}
	},
	getSection(node: Node | Range): Element {
		if (node instanceof Range) node = node.commonAncestorContainer;
		let ele = this.getItem(node);
		while (ele) {
			if (this.getRole(ele) == "heading") return ele;
			ele = ele.previousElementSibling;
		}
	},
	getItem(node: Node | Range): Element {
		if (node instanceof Range) node = node.commonAncestorContainer;
		let ele = node as Element;
		let items = this.getItems(node);
		if (items) while (ele) {
			if (ele.parentElement == items) return ele;
			ele = ele.parentElement;
		}
		return null;
	},
	setItem(item: Element, role: string, level: number) {
		// if (this.getItem(item) != item) {
		// 	console.error("Argument is not an Item.");
		// 	return;
		// }
		this.getOwner(item).getId(item); //Ensure the item's id is set as well.
		if (!role) {
			item.removeAttribute("role");
		} else {
			item.setAttribute("role", role);
		}
		if (!level) {
			item.removeAttribute("aria-level");
		} else {
			item.setAttribute("aria-level", "" + level);
		}
	},
	getRole(item: Element) {
		return item?.getAttribute("role") || "";
	},
	getLevel(item: Element) {
		return (item?.ariaLevel as any) * 1 || 0;
	},
	getItemRange(article: Element, startId: string, endId: string) {
		let range = article.ownerDocument.createRange();
		range.selectNodeContents(article);
		if (startId) {
			let start = article.ownerDocument.getElementById(startId);
			if (!start) throw new Error(`Start item.id '${startId}' not found.`);
			range.setStartAfter(start);
		}
		if (endId) {
			let end = article.ownerDocument.getElementById(endId);
			if (!end) throw new Error(`End item.id '${endId}' not found.`);
			range.setEndBefore(end);
		}
		return range;
	},
	toTextLines(range: Range): string {
		let out = "";
		let items = this.getItems(range);
		if (range.commonAncestorContainer == items) {
			for (let item of range.cloneContents().childNodes) {
				out += item.textContent + "\r\n";
			}
		} else {
			out = range.cloneContents().textContent;
		}
		return out;
	},
	itemsFromText(doc: Document, text: string) {
		let i = 0;
		let out = doc.createElement("DIV");
		while (i < text.length) {
			let idx = text.indexOf("\n", i + 1);
			if (idx < 0) idx = text.length;
			let item = doc.createElement("P");
			item.textContent = text.substring(i, idx);
			out.append(item);
			i = idx;
		}
		return out;
	}
}