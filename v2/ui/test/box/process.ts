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
	let issues: Box[] = [];
	let current: Box;
	for (let item of filterEmpty(data)) {
		switch (item.type) {
			case "s":
				id(issues, ctxId, item);
				if (item.qty) {
					item.boxes = [];
					processQty(item);	
				}
				current = null;
				break;
			case "g":
				id(issues, ctxId, item);
				item.boxes = [];
				current = item;
				break;
			case "c":
				processChild(current, item);
				break;
			case "p":
				issues.push(item);
				break;
		}
	}
	return issues;
}

let nextIssue = 1;
let nextVariety = 1;

function id(issues: Box[], era: string, data: Box) {
	let id =  era + (nextIssue < 10 ? "0" : "") + nextIssue;
	data["id"] = id;
	issues.push(data);
	nextIssue++;
	nextVariety = 1;
}

function processChild(set: Box, item: Box) {
	if (!set || !set.boxes) {
		console.warn("No current Set for variety.");
		return;
	}
	let variety = extend(set, item) as Box;
	variety.id = set.id + nextVariety++;
	if (variety.title && !Object.hasOwn(item, "title")) variety.title = "";
	set.boxes["#" + variety.id] = variety;
}

function processQty(run: Box) {
	for (let i = 0; i < run.qty; i++) {
		let variety = Object.create(run) as Box;
		variety.id = run.id + (i + 1);
		//Supress the caption from the run prototype
		if (variety.title) variety.title = "";
		run.boxes["#" + variety.id] = variety;	
	}
}