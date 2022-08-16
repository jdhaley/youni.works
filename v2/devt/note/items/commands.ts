import { Command } from "../../../base/command.js";
import {Edit, ItemRange, unmark} from "./edit.js";
import items from "./items.js";

export {RangeCommand, LevelCommand};

abstract class ItemsCommand extends Command<Range> {
	article: Element;
	items: ItemRange;
	get name() {
		return this.items?.name;
	}
	constructor(article: Element, edit: ItemRange) {
		super()
		this.article = article;
		this.items = edit;
	}
	abstract undo(): Range;
	abstract redo(): Range;
}

class RangeCommand extends ItemsCommand {
	declare items: Edit;
	constructor(article: Element, edit: Edit) {
		super(article, edit);
	}
	protected replace(markup: string): Range {
		let range = items.getItemRange(this.article, this.items.startId, this.items.endId);
		range.deleteContents();
	
		let nodes = items.getOwner(this.article).createNodes(markup);
		for (let i = 0; i < nodes.length; i++) {
			range.insertNode(nodes[i]);
			range.collapse();
		}
		return unmark(range, "edit");
	}
	undo() {
		return this.replace(this.items.before);
	}
	redo() {
		return this.replace(this.items.after);
	}
}

class LevelCommand extends ItemsCommand {
	constructor(name: "Promote" | "Demote", article: Element, startId: string, endId: string) {
		super(article, {
			name: name,
			timestamp: Date.now(),
			startId: startId,
			endId: endId
		});
	}
	exec(way?: "Promote" | "Demote") {
		if (!way) way = this.items.name as any;
		let adjust = way == "Promote" ? -1 : 1;
		let doc = this.article.ownerDocument;
		let start = doc.getElementById(this.items.startId) as HTMLElement;
		let end = doc.getElementById(this.items.endId) as HTMLElement;
		let range = doc.createRange();
		range.setStartBefore(start);
		range.setEndAfter(end);
		if (start == end) {
			level(start, adjust);
		} else {
			for (let item = start; item; ) {
				let level = items.getLevel(item) + adjust;
				if (level >= 0 && level <= 6) items.setItem(item, level ? "listitem" : "", level);
				item = (item.id == this.items.endId ? null : item.nextElementSibling as HTMLElement)
			}
		}
		return range;
	}
	undo() {
		return this.exec(this.items.name == "Promte" ? "Demote" : "Promote");
	}
	redo() {
		return this.exec();
	}
}


function level(item: HTMLElement, adjust: number) {
	return adjust < 0 ? promote(item) : demote(item);
	function demote(item: HTMLElement) {
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
	
	function promote(item: HTMLElement) {
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