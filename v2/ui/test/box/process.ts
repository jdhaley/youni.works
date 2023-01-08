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

export function process(ctxId: string, data: Iterable<Box>): Box[] {
	let items: Box[] = [];
	let current: Box;
	for (let item of filterEmpty(data)) {
		switch (item.type) {
			case "s":
				id(items, ctxId, item);
				if (item.qty) {
					item.boxes = [];
					processQty(item);	
				}
				current = null;
				break;
			case "g":
				id(items, ctxId, item);
				item.boxes = [];
				current = item;
				break;
			case "c":
				processChild(current, item);
				break;
			case "p":
				items.push(item);
				break;
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
	group.boxes["#" + item.id] = item;
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