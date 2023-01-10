import { bundle, extend } from "../../../base/util.js";
import { diffs, Issue, Set, Variety } from "./stamp.js";

export interface StampData {
	date: string;
	issue: number;
	variety: number;
	minor: string;
	denom: string;
}

function filterEmpty<T>(it: Iterable<T>): Iterable<T> {
	return  {
		*[Symbol.iterator]() {
			for (let current of it) {
				if (Object.keys(current).length) yield current;
			}
		}
	}
}

export function processIssues(region: string, era: string, data: Iterable<StampData>): bundle<Issue> {
	let issues: bundle<Issue> = Object.create(null);
	let current: Issue;
	for (let item of filterEmpty(data)) {
		if (typeof item.date == "number") item.date = "" + item.date;
		if (item.issue) {
			current = toIssue(era, item);
			if (!item.denom) (current as Set).varieties = Object.create(null);
			issues[region + current.id] = current;			
		} else if (item.variety) {
			let cv = current as Variety;
			if (cv.partOf) current = cv.partOf;
			current = processVariety(current as Set, item);
		} else {
			processMinor(current as Variety, item);
		}
	}
	return issues;
}
function processVariety(set: Set, item: StampData): Variety {
	if (!set || !set.varieties) {
		console.warn("No current Set for variety.");
		return;
	}
	if (item.minor) console.warn("A major variety cannot have a minor value.");
	let variety = extend(set, item) as Variety;
	variety.id = set.id + item.variety;
	variety.partOf = set;
	variety.diff = diff(variety, set);
	if (variety.subject && !Object.hasOwn(item, "subject")) variety.subject = "";
	if (variety.br && !Object.hasOwn(item, "br")) variety.br = "";
	set.varieties["#" + variety.id] = variety;
	return variety;
}
function processMinor(variety: Variety, item: StampData) {
	if (!variety) {
		console.warn("No current variety for minor");
		return;
	}
	let set = variety.partOf;
	if (!set) console.warn("A minor cannot be specified for a singleton variety... convert to a set.");
	let minor = extend(variety, item) as Variety;
	minor.id = variety.id + item.minor;
	minor.partOf = set;
	minor.diff = diff(minor, variety);
	if (!Object.hasOwn(item, "subject")) minor.subject = "";
	set.varieties["#" + minor.id] = minor;
}

function toIssue(era: string, data: StampData): Issue {
	if (data.variety || data.minor) console.warn("An Issue should not have a variety or minor value.");
	let id =  era + (data.issue < 10 ? "0" : "") + data.issue;
	data["id"] = id;
	return data as any as Issue;
}

function diff(variety: Variety, ctx: Issue) {
	let diff = "";
	for (let name in variety) {
		if (diffs.indexOf(name) >= 0 && variety[name] != ctx[name]) {
			if (diff) diff += ", ";
			diff += variety[name];
		}
	}
	return diff;
}