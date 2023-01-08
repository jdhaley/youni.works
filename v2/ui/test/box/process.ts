import { extend } from "../../../base/util.js";
import { Box } from "./model.js";

function filterEmpty<T>(it: Iterable<T>): Iterable<T> {
	return  {
		*[Symbol.iterator]() {
			for (let current of it) {
				if (Object.keys(current).length) yield current;
			}
		}
	}
}
/*
ctxId - region/era - replace with page property.
*/
function doLevel(ctxId: string, items: Box[], item: Box, current: Box): Box {
	let level = Number(item.level);
	if (level > 1) {
		while (Number(current.level) >= level) {
			current = current.partOf;
		}
		if (!current.boxes) current.boxes = Object.create(null);
		current = processChild(current, item);
	} else {
		current = item;
		id(items, ctxId, item);
		if (item.qty) {
			item.boxes = Object.create(null);
			processQty(item);
			current = null;
		}
	}
	return current;
}
export function process(ctxId: string, data: Iterable<Box>): Box[] {
	let items: Box[] = [];
	let current: Box;
	for (let item of filterEmpty(data)) {
		if (Number(item.level)) {
			current = doLevel(ctxId, items, item, current);
			continue;
		} else {
			items.push(item);
		}
	}
	return items;
}

let nextIssue = 1;
let nextVariety = 1;

function id(items: Box[], era: string, data: Box) {
	let id =  era + (nextIssue < 10 ? "0" : "") + nextIssue;
	data["id"] = id;
	items.push(data);
	nextIssue++;
	nextVariety = 1;
}

function processChild(group: Box, item: Box) {
	if (!group || !group.boxes) {
		console.warn("No current group for child item.");
		return;
	}
	item = extend(group, item) as Box;
	item.id = group.id + nextVariety++;
	if (item.title && !Object.hasOwn(item, "title")) item.title = "";
	item.partOf = group;
	group.boxes["#" + item.id] = item;
	return item;
}

function processQty(run: Box) {
	for (let i = 0; i < run.qty; i++) {
		let item = Object.create(run) as Box;
		item.id = run.id + (i + 1);
		//Supress the caption from the run prototype
		if (item.title) item.title = "";
		run.boxes["#" + item.id] = item;
	}
}