import { CommandBuffer} from "../../../base/command.js";
import {RangeCommand, LevelCommand} from "./commands.js";

import items from "./items.js";
import {mark, unmark, startEdit, replace, edit} from "./edit.js";

export {RangeCommands};

interface Editor extends CommandBuffer<Range> {
	edit(name: string, range: Range, replacement: string, offset: number): Range;
	replace(name: string, range: Range, replacement: string): Range;
	insert(range: Range): Range;
	split(range: Range): Range;
	level(name: "Promote" | "Demote", range: Range): Range;
}

class RangeCommands extends CommandBuffer<Range> implements Editor {
	#commands = new CommandBuffer<Range>();
	#trk: Node = null;
	undo(): Range {
		return this.#commands.undo();
	}
	redo(): Range {
		return this.#commands.redo();
	}
	replace(name: string, range: Range, replacement: string) {
		this.#trk = null;
		let cmd = new RangeCommand(items.getItems(range), startEdit(name, range));
		this.#commands.add(cmd);
		cmd.items.after = replace(items.getItems(range) /*TODO this.view*/, replacement, false);
		return unmark(range, "edit");
	}
	edit(name: string, range: Range, replacement: string, offset: number) {
		let cmd = this.#commands.peek() as RangeCommand;
		if (cmd.items?.name == name && this.#trk == range.commonAncestorContainer) {
		} else {
			this.#trk = range.commonAncestorContainer;
			cmd = new RangeCommand(items.getItems(range), startEdit(name, range));
			this.#commands.add(cmd);
			unmark(range, "edit");
			range.collapse(); //TODO more analysis of the unmark logic.
		}
		cmd.items.after = edit(range, replacement, offset);
		return range;
	}
	level(name: "Promote" | "Demote", range: Range): Range {
		let start = items.getItem(range.startContainer);
		let end = items.getItem(range.endContainer);
		//If a range of items, check that there are no headings
		if (start != end) for (let item = start; item; item = item.nextElementSibling) {
			let role = items.getRole(item);
			if (role == "heading") {
				console.warn("No range promote with headings");
				return range;
			}
			if (item.id == end.id) break;
		}
		let owner = items.getOwner(range);
		let cmd = new LevelCommand(name, items.getItems(range), owner.getId(start), owner.getId(end));
		this.#commands.add(cmd);
		cmd.exec();
		return range;
	}
	insert(range: Range) {
		let item = items.getItem(range);
		let cmd = new RangeCommand(items.getItems(range), startEdit("split", range));
		this.#commands.add(cmd);
		unmark(range, "edit");

		let ins = item.ownerDocument.createElement("P");
		if (items.getRole(item) != "heading") {
			items.setItem(ins, items.getRole(item), items.getLevel(item));
		}
		ins.innerHTML = "&nbsp;";

		range.selectNodeContents(ins.firstChild);
		range.collapse(true);
		mark(range, "edit");
		cmd.items.after = ins.outerHTML + item.outerHTML;
		item.parentElement.insertBefore(ins, item);
		return unmark(range, "edit");
	}
	insertEntry(range: Range) {
		let item = items.getItem(range);
		let cmd = new RangeCommand(items.getItems(range), startEdit("insert entry", range));
		this.#commands.add(cmd);
		unmark(range, "edit");

		let ins = item.ownerDocument.createElement("DIV");
		items.setItem(ins, "term", 1);
		ins.innerHTML = "<div class='dt'>key</div><div class='dd' >value</div>";
		range.selectNodeContents(ins.firstChild);
		range.collapse(true);
		mark(range, "edit");
		cmd.items.after = ins.outerHTML + item.outerHTML;
		item.parentElement.insertBefore(ins, item);
		return unmark(range, "edit");
	}
	split(range: Range) {
		let owner = items.getOwner(range);
		let item = items.getItem(range);
		let cmd = new RangeCommand(items.getItems(range), startEdit("split", range));
		this.#commands.add(cmd);
		unmark(range, "edit");

		let ins = item.ownerDocument.createElement("P");
		if (items.getRole(item) != "heading") {
			items.setItem(ins, items.getRole(item), items.getLevel(item));
		}
		owner.getId(ins);
		ins.innerHTML = owner.markup(range) || "&nbsp;";
		//Modify the document now...
		range.deleteContents();
		item.parentElement.insertBefore(ins, item.nextSibling);
		//done.
		range.selectNodeContents(ins);
		range.collapse(true);
		mark(range, "edit");
		cmd.items.after = item.outerHTML + ins.outerHTML;
		return unmark(range, "edit");
	}
}