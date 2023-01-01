import { bundle, extend } from "../../../base/util.js";
import { Issue, Variety } from "./stamp.js";

export interface StampData {
	date: string;
	design: string;
	variety: string;
	denom: string;

}

export function processStampData(data: StampData[]): bundle<Issue> {
	let issues: bundle<Issue> = Object.create(null);
	let design: Issue;
	for (let item of data) {
		if (item.denom) {
			if (item.design) {
				if (item.variety) console.warn("Singleton variety should not have a variety value.");
				//A row with both a denom & design number is a singleton variety
				let issue = toIssue(item);
				issues[issue.id] = issue;
				design = null;
			} else {
				processVariety(design, item.variety, item);
			}
		} else {
			design = processDesign(design, item);
			if (design && !design.partOf) issues[design.id] = design;
		}
	}
	return issues;
}
function processDesign(design: Issue, data: StampData): Issue {
	let issue: Issue;
	if (Number(data.design)) {
		issue = toIssue(data);
		issue.varieties = Object.create(null);
	} else {
		//A minor design is an alphabetic value
		if (design) {
			//If the current design is a minor design, pop the major design.
			if (design.partOf) design = design.partOf;
			issue = extend(design, data);
			issue.id = design.id + data.design;
			issue.partOf = design;
			if (!design.minorIssues) design.minorIssues = Object.create(null);
			design.minorIssues[issue.id] = issue;
		} else {
			console.warn("Minor design without a Design parent.")
		}
	}
	return issue;
}
function processVariety(design: Issue, vno: string, item: StampData) {
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