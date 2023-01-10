import { EMPTY, extend } from "../../../base/util.js";
import { diffs } from "./stamp.js";

export interface Box {
	level: number;
	partOf: Box;
	parts?: Box[];
	caption: string;

	header: unknown;
	body: unknown;
	footer: unknown;

	width: number;
	height: number;
	rotation: number;
	shape: string;
	qty: string | number;
}

export interface Issue {
	id: string;
//	diff: string;

	level: number;
	caption: string;
	partOf: Issue;
	parts: Issue[];

	type: string;
	subject: string;
	denom: string;
	colors: string;
	date: string;
	method: string;
	purpose: string;
	separation: string;
	paper: string;
	tagging: string;

	shape: string;
	width: number;
	height: number;
	rotation: number;
}
class IssueBox  {
	declare type: string;
	declare denom: string;
	declare colors: string;
	declare id: string;
	declare subject: string;
	get caption() {
		if (this.type == "i") {
			return years(this as any) + this.subject;
		}
		return this.subject;
	}
	get header() {
		return this.denom;
	}
	get body() {
		return this.colors;
	}
	get footer() {
		return this.id;
	}
}
let IB = new IssueBox();

export function processIssues(region: string, era: string, data: Iterable<Issue>): Iterable<Issue> {
	let pages: Issue[] = [];
	let current: Issue;
	let page: Issue;
	for (let item of data) {
		if (typeof item.date == "number") item.date = "" + item.date;
		item.parts = EMPTY.array;
		switch (item.type) {
			case "i":
				current = toIssue(era, item);
				page.parts.push(current);
				break;
			case "v":
				if (current.partOf) current = current.partOf;	
				current = processVariety(current, item);
				break;
			case "m":
				processMinor(current, item);
				break;
			default:
				item.level = 0;
				item.parts = [];
				page = item;
				pages.push(page);
		}
	}
	for (let page of pages) {
		for (let item of page.parts) {
			let diffs = diffSet(item);
		}
	}
	return pages;
}

function processVariety(set: Issue, item: Issue): Issue {
	if (set.parts == EMPTY.array) set.parts = [];
	let variety = extend(set, item) as Issue;
	variety.level = 2;
	variety.id = set.id + (set.parts.length + 1);
	variety.partOf = set;
	if (variety.subject && !Object.hasOwn(item, "subject")) variety.subject = "";
	set.parts.push(variety);
	return variety;
}

function processMinor(variety: Issue, item: Issue) {
	if (variety.parts == EMPTY.array) variety.parts = [];
	let minor = extend(variety, item);
	minor.level = 3;
	minor.id = variety.id + String.fromCharCode("a".charCodeAt(0) + variety.parts.length);
	minor.partOf = variety;
	if (!Object.hasOwn(item, "subject")) minor.subject = "";
	variety.parts.push(minor);
}

let NEXT_ISSUE = 1;
function toIssue(era: string, data: Issue) {
	data = extend(IB, data);
	data.id =  era + (NEXT_ISSUE < 10 ? "0" : "") + NEXT_ISSUE++;
	data.level = 1;

	return data;
}

function diff(variety: Issue, ctx: Issue) {
	let diff = "";
	for (let name in variety) {
		if (diffs.indexOf(name) >= 0 && variety[name] != ctx[name]) {
			if (diff) diff += ", ";
			diff += variety[name];
		}
	}
	return diff;
}

function toYear(issue: Issue, endYear: number) {
	for (let part of issue.parts) {
		let yr = Number(part.date?.substring(0, 4)) || 0;
		if (yr > endYear) endYear = yr;
	}
	return endYear;
}

function years(set: Issue) {
	if (!set.date) return "";
	let startYear = Number(set.date?.substring(0, 4));
	let endYear = toYear(set, startYear);
	for (let issue of set.parts) {
		endYear = toYear(issue, endYear);
	}
	let years = "" + startYear;
	if (startYear != endYear) {
		years += "–";
		let end = "" + endYear;
		if (years.substring(0, 2) != end.substring(0, 2)) {
			years += end;
		} else {
			years += end.substring(2);
		}
	}
	return years + ". ";
}

function diffSet(set: Issue) {
	let base = "";
	let diffs = Object.create(null);
	let issues: Element;
	let text = years(set) + ". " + set.subject;
	for (let variety of set.parts) {
		let d = diff(variety, set);
		if (!diffs[d]) diffs[d] = [];
		diffs[d].push(variety);
		for (let minor of variety.parts) {
			let d = diff(minor, set);
			if (!diffs[d]) diffs[d] = [];
			diffs[d].push(minor);
		}
	}
}
