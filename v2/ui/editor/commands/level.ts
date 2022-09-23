import { Edit } from "./edit.js";
import { items } from "../util.js";
import { getChildEditor } from "../../display/editor.js";

export class LevelCommand extends Edit {
	declare name: "Promote" | "Demote";
	startId: string;
	endId: string;
	exec(range: Range): Range {
		let editor = this.owner.getControl(this.viewId);
		this.startId = getChildEditor(editor, range.startContainer)?.node.id;
		this.endId = getChildEditor(editor, range.endContainer)?.node.id;
		this.do(this.name);
		console.log(this);
		return range;
	}
	protected do(way: "Promote" | "Demote") {
		let adjust = way == "Promote" ? -1 : 1;
		let start = this.owner.getControl(this.startId).node;
		let end = this.owner.getControl(this.endId).node;
		if (start == end) {
			level(start, adjust);
		} else {
			for (let item = start; item; ) {
				let level = items.getLevel(item) + adjust;
				if (level >= 0 && level <= 6) items.setItem(item, level);
				item = (item.id == this.endId ? null : item.nextElementSibling as HTMLElement)
			}
		}

		let range = start.ownerDocument.createRange();
		range.setStartBefore(start);
		range.setEndAfter(end);
		return range;
	}
	undo() {
		return this.do(this.name == "Promote" ? "Demote" : "Promote");
	}
	redo() {
		return this.do(this.name);
	}
}

function level(item: Element, adjust: number) {
	return adjust < 0 ? promote(item) : demote(item);

	function demote(item: Element) {
		let level = items.getLevel(item);
		if (items.getRole(item) == "heading") {
			let section = items.getSection(item.previousSibling as Element);
			if (level > items.getLevel(section) || level == 6) {
				items.setItem(item, 0);
			} else if (level < 6) {
				items.setItem(item, ++level, "heading");
			}
		} else if (level < 6) {
			items.setItem(item, ++level, items.getRole(item));
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
					items.setItem(item, 0); //Normal para
				}
			} else {
				//Promote paragraph to heading.
				let sectionLevel = items.getSection(item)?.ariaLevel as any * 1 + 1 || 1;
				items.setItem(item, sectionLevel > 6 ? 6 : sectionLevel, "heading");
			}
		}
	}	
}
