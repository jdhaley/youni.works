import { bundle } from "../../../base/util";

export const diffs = ["purpose", "method", "paper", "tagging", "separation", "other"];

export interface Shape {
	width: number;
	height: number;
	shape?: "triangle" | "diamond" | "ellipse" | string;
}

export interface Design {
	subject: string;
	method: "Engr" | "Typo" | "Litho" | "Photo" | string;
	rotation: 1 | 2 | 3;
}

export interface Media {
	/** Paper type, paper color, etc. */
	paper: "Wove" | "Granite" | string;
	/** Watermark, Phosphor, Printed Control Numbers on Back, etc. */
	tagging: string;
	/** Perf value, Imperf, Die Cut, Roulette, etc. */
	separation: string;
}

export interface Issue extends Shape, Design, Media {
	id: string;
	purpose: "Air" | "Charity" | "Due" | "Tax" | string;
	date: string;
	/** Both within this and other numbering systems. Each system requires a defined prefix. */
	crossReference: string;
	other: string;
}

export interface Set extends Issue {
	varieties: bundle<Variety>;
}

export interface Variety extends Issue {
	partOf?: Set;
	minor?: string;
	denom: string;
	/** unspecified color is "multicolored" */
	colors?: string;
	overprint?: string;
	diff?: string;
	mint?: rating;
	used?: rating;
}

/**
 * Ratings:
 * 		The values below are in no specific currency, e.g.
 * 		it could be dollars, euros, pounds, etc.
 * 		blank - not rated.
 * 		0 - Common variety, no specific value.
 * 		1 - Under 2.00
 * 		2 - 2.00 up to 20.00
 * 		3 - 20.00 up to 200.00
 * 		4 - 200.00 up to 2000.00
 * 		5 - Over 2000.00
*/
export type rating = 0 | 1 | 2 | 3 | 4 | 5;