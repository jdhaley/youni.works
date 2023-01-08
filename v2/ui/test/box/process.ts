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
	while (current.level >= item.level) {
		current = current.partOf;
	}
	current = processChild(current, item);
	if (current.qty) {
		processQty(current);
	}
	return current;
}
export function process(ctxId: string, data: Iterable<Box>): Box[] {
	let items: Box[] = [];
	let current: Box;
	for (let item of filterEmpty(data)) {
		item.parts = [];
		if (Number(item.level)) {
			current = doLevel(ctxId, items, item, current);
		} else {
			items.push(item);
			current = item;
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
	item = extend(group, item) as Box;
	item.id = group.id + nextVariety++;
	if (item.title && !Object.hasOwn(item, "title")) item.title = "";
	item.partOf = group;
	group.parts.push(item);
	return item;
}

function processQty(run: Box) {
	for (let i = 0; i < run.qty; i++) {
		let item = Object.create(run) as Box;
		item.id = run.id + (i + 1);
		item.parts = [];
		//Supress the caption from the run prototype
		if (item.title) item.title = "";
		run.parts.push(item);
	}
}