import { bundle, extend } from "../../../base/util.js";
import { Issue, Set, Variety } from "./stamp.js";

export interface StampData {
	date: string;
	design: string;
	variety: string;
	denom: string;
}

export function processStampData(data: StampData[]): bundle<Issue> {
	let issues: bundle<Issue> = Object.create(null);
	let set: Set;
	for (let item of data) {
		item.date = item.date ? "" + item.date : "";
		if (item.denom) {
			if (item.design) {
				if (item.variety) console.warn("Singleton variety should not have a variety value.");
				//A row with both a denom & design number is a singleton variety
				let issue = toIssue(item);
				issues[issue.id] = issue;
				set = null;
			} else {
				processVariety(set, item.variety, item);
			}
		} else {
			set = processDesign(set, item);
			if (set && !set.partOf) issues[set.id] = set;
		}
	}
	return issues;
}
function processDesign(design: Set, data: StampData): Issue {
	let set: Set;
	if (Number(data.design)) {
		set = toIssue(data);
		set.varieties = Object.create(null);
	} else {
		//A minor design is an alphabetic value
		if (design) {
			//If the current design is a minor design, pop the major design.
			if (design.partOf) design = design.partOf;
			set = extend(design, data);
			set.id = design.id + data.design;
			set.partOf = design;
			if (!design.minorIssues) design.minorIssues = Object.create(null);
			design.minorIssues[set.id] = set;
		} else {
			console.warn("Minor design without a Design parent.")
		}
	}
	return set;
}
function processVariety(design: Set, vno: string, item: StampData) {
	if (design) {
		let variety = extend(design, item) as Variety;
		variety.id = design.id + vno;
		variety.partOf = design;
		if (!Object.hasOwn(item, "subject")) variety.subject = "";
		design.varieties[variety.id] = variety;
	} else {
		console.warn("Variety without a Design parent.");
	}
}
function toIssue(data: StampData): Issue {
	let date = "" + (Number.parseInt(("" + data.date).substring(0, 4)) - 1800);
	let design =  "" + (("" + data.design).length == 1 ? "0" : "") + data.design;
	data["id"] = "" + date + design + (data.variety || "");
	return data as any as Issue;
}