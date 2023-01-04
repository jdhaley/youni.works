import { bundle, extend } from "../../../base/util.js";
import { Issue, Set, Variety } from "./stamp.js";

export interface StampData {
	date: string;
	issue: number;
	variety: number;
	minor: string;
	denom: string;
}

export function processIssues(region: string, era: string, data: StampData[]): bundle<Issue> {
	let issues: bundle<Issue> = Object.create(null);
	let current: Issue;
	for (let item of data) {
		//Ignore empty objects parsed from CSV
		if (!Object.keys(item).length) continue;
		if (typeof item.date == "number") item.date = "" + item.date;
		if (item.issue) {
			if (item.variety || item.minor) console.warn("An Issue should not have a variety or minor value.");
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
function processMinor(variety: Variety, item: StampData) {
	if (!variety) console.warn("No variety for minor");
	let set = variety.partOf;
	if (!set) console.warn("A minor cannot be specified for a singleton variety... convert to a set.");
	let minor = extend(variety, item) as Variety;
	minor.id = variety.id + item.minor;
	minor.partOf = set;
	if (!Object.hasOwn(item, "subject")) minor.subject = "";
	set.varieties["#" + minor.id] = minor;
}
function processVariety(set: Set, item: StampData): Variety {
	if (!set || !set.varieties) console.warn("No current Set for variety.");
	if (item.minor) console.warn("A major variety should not have a minor value.");
	let variety = extend(set, item) as Variety;
	variety.id = set.id + item.variety;
	variety.partOf = set;
	if (!Object.hasOwn(item, "subject")) variety.subject = "";
	set.varieties["#" + variety.id] = variety;
	return variety;
}
function toIssue(era: string, data: StampData): Issue {
	let id =  era + (data.issue < 10 ? "0" : "") + data.issue;
	if (data.variety) id += data.variety;
	if (data.minor) id += data.minor;
	data["id"] = id;
	return data as any as Issue;
}