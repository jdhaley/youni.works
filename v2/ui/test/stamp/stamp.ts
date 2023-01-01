import { bundle } from "../../../base/util";

export interface Design {
	purpose: "Air" | "Charity" | "Due" | "Tax" | string;
	subject: string;
	method: "Engr" | "Typo" | "Litho" | "Photo" | string;
	width: number;
	height: number;
	shape: "triangle" | "diamond" | "ellipse" | string;
	rotation: 1 | 2 | 3;
}
export interface Media {
	paper: string;
	tagging:string;
	wmk: string;
	separation: string;
}

export interface Issue extends Design, Media {
	id: string;
	partOf?: Issue;
	date: string;
	varieties?: bundle<Variety>;
	minorIssues?:  bundle<Issue>;
}

export interface Variety extends Issue {
	denom: string;
	colors: string; //falsy color is "multicolored"
	overprint: string;
	other: string;
	mint: rating;
	used: rating;
	refs: string;
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