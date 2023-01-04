import { bundle } from "../../../base/util";

export const diffs = ["purpose", "method", "paper", "tagging", "separation", "otherDesignAttrs", "otherMediaAttrs"];
	
export interface Design {
	subject: string;
	method: "Engr" | "Typo" | "Litho" | "Photo" | string;
	width: number;
	height: number;
	shape: "triangle" | "diamond" | "ellipse" | string;
	rotation: 1 | 2 | 3;
	otherDesignAttrs: string;
}

export interface Media {
	/** Paper type, paper color, etc. */
	paper: "Wove" | "Granite" | string;
	/** Watermark, Phosphor, Printed Control Numbers on Back, etc. */
	tagging: string;
	/** Perf value, Imperf, Die Cut, Roulette, etc. */
	separation: string;
	otherMediaAttrs: string;
}

export interface Issue extends Design, Media {
	id: string;
	purpose: "Air" | "Charity" | "Due" | "Tax" | string;
	date: string;
	crossReference: string;
}

export interface Set extends Issue {
	varieties?: bundle<Variety>;
}

export interface Variety extends Issue {
	partOf?: Set;
	denom: string;
	colors: string; //unspecified color is "multicolored"
	overprint: string;
	mint: rating;
	used: rating;
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