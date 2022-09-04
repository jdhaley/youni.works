import {Edit, Editable, getViewById} from "./editor.js";
import { getChildView, getEditableView } from "./util.js";

export class LevelCommand extends Edit {
	startId: string;
	endId: string;
	exec(range: Range): Range {
		let view = getViewById(this.owner, this.viewId);
		let content = view.$controller.getContentOf(view);
		this.startId = getChildView(content, range.startContainer).id;
		this.endId = getChildView(content, range.endContainer).id;
		this.do();
		return range;
	}
	protected do(way?: "Promote" | "Demote") {
		if (!way) way = this.name as any;
		let adjust = way == "Promote" ? -1 : 1;
		let start = getViewById(this.owner, this.startId);
		let end = getViewById(this.owner, this.endId);
		if (start == end) {
			level(start, adjust);
		} else {
			for (let item = start; item; ) {
				let level = items.getLevel(item) + adjust;
				if (level >= 0 && level <= 6) items.setItem(item, level ? "listitem" : "", level);
				item = (item.id == this.endId ? null : item.nextElementSibling as HTMLElement)
			}
		}

		let range = start.ownerDocument.createRange();
		range.setStartBefore(start);
		range.setEndAfter(end);
		return range;
	}
	undo() {
		return this.do(this.name == "Promte" ? "Demote" : "Promote");
	}
	redo() {
		return this.do();
	}
}

function level(item: Element, adjust: number) {
	return adjust < 0 ? promote(item) : demote(item);

	function demote(item: Element) {
		let level = items.getLevel(item);
		if (items.getRole(item) == "heading") {
			let section = items.getSection(item.previousSibling as Element);
			if (level > items.getLevel(section) || level == 6) {
				items.setItem(item, "", 0);
			} else if (level < 6) {
				items.setItem(item, "heading", ++level);
			}
		} else if (level < 6) {
			items.setItem(item, items.getRole(item) == "term" ? "term" : "listitem", ++level);
		}
	}
	
	function promote(item: Element) {
		let level = (item.ariaLevel as any) * 1 || 0;
		if (items.getRole(item) == "heading") {
			item.ariaLevel = "" + (level - 1 || 1);
		} else {
			if (items.getRole(item) == "listitem" || items.getRole(item) == "term") {
				let level = item.ariaLevel as any * 1 - 1 || 0;
				if (level > 0) {
					item.ariaLevel = "" + level;
				} else {
					items.setItem(item, "", 0); //Normal para
				}
			} else {
				//Promote paragraph to heading.
				let sectionLevel = items.getSection(item)?.ariaLevel as any * 1 + 1 || 1;
				items.setItem(item, "heading", sectionLevel > 6 ? 6 : sectionLevel);
			}
		}
	}	
}

const items = {
	getSection(node: Node | Range): Element {
		if (node instanceof Range) node = node.commonAncestorContainer;
		let ele = getEditableView(node);
		while (ele) {
			if (this.getRole(ele) == "heading") return ele;
			ele = ele.previousElementSibling;
		}
	},
	setItem(item: Element, role: string, level: number) {
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
	}
}