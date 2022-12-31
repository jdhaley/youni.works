import { extend } from "../../../base/util.js";

export interface Issue {
	id: string;
	partOf?: Set;
	date: string;
	colors: string;
	subject: string;
	width: number;
	height: number;
	shape: "triangle" | "diamond" | "ellipse" | string;
	rotation: 1 | 2 | 3;
	overprint: string;
	purpose: "Air" | "Charity" | "Due" | "Tax" | string;
	method: "Engr" | "Typo" | "Litho" | "Photo" | string;
	separation: string;
	wmk: string;
	paper: string;
	tagging:string;
	refs: string;
	other: string;
}
/**
 * Ratings:
 * 		The values below are in no specific currency, e.g.
 * 		it could be dollars, euros, pounds, etc.
 * 		blank - not rated.
 * 		0 - Common variety, no specific value.
 * 		1 - Under 2.00
 * 		2 - Under 20.00
 * 		3 - Under 100.00
 * 		4 - Under 1000.00
 * 		5 - Over 1000.00
  */
export type rating = 0 | 1 | 2 | 3 | 4 | 5;
export interface Variety extends Issue {
	denom: string;
	mint: rating;
	used: rating;
}
export interface Set extends Issue {
	varieties: {
		[key: string]: Variety;
	}
	minorDesigns: {
		[key: string]: Set;
	}
}

export interface StampData extends Set, Variety {
	design: string;
	variety: string;
}

export function process(data: StampData[]) {
	let designs = Object.create(null);
	let design: Set;
	for (let item of data) {
		if (item.denom) {
			if (item.design) {
				if (item.variety) console.warn("Singleton variety should not have a variety value.");
				//A row with both a denom & design number is a singleton variety
				item.id = toId(item.date, item.design);
				designs[item.id] = item;
				design = null;
			} else {
				processVariety(design, item);
			}
		} else {
			design = processDesign(design, item);
			if (design && !design.partOf) designs[design.id] = design;
		}
	}
	console.log(designs);
}
function processDesign(design: Set, item: StampData): Set {
	if (Number(item.design)) {
		item.id = toId(item.date, item.design);
		item.varieties = Object.create(null);
	} else {
		//A minor design is an alphabetic value
		if (design) {
			//If the current design is a minor design, pop the major design.
			if (design.partOf) design = design.partOf;
			let minorDesign = design.id + item.design;
			item = extend(design, item);
			item.partOf = design;
			item.id = minorDesign;
			if (!design.minorDesigns) design.minorDesigns = Object.create(null);
			design.minorDesigns[item.id] = item;
		} else {
			console.warn("Minor design without a Design parent.")
		}
	}
	return item;
}
function processVariety(design: Set, variety: StampData) {
	if (design) {
		variety = extend(design, variety);
		variety.id = design.id + variety.variety;
		variety.partOf = design;
		design.varieties[variety.id] = variety;
	} else {
		console.warn("Variety without a Design parent.");
	}
}
function toId(date: unknown, design: unknown, variety?: unknown) {
	date = "" + (Number.parseInt(("" + date).substring(0, 4)) - 1800);
	design =  "" + (("" + design).length == 1 ? "0" : "") + design;
	return "" + date + design + (variety || "");
}