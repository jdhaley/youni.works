export interface Shape {
	area: Area;
	size(width: number, height: number): void;
	position(x: number, y: number): void;
	zone(x: number, y: number): Zone;
	getStyle(name: string): string;
	setStyle(name: string, value?: string): void; // Omitting the value removes the style.
}

export interface Point {
	x: number,
	y: number,
}

export interface Area extends Point {
	width: number,
	height: number
}

export interface Edges {
	top: number,
	right: number,
	bottom: number,
	left: number
}

export type Zone = "TL" | "TC" | "TR" | "CL" | "CC" | "CR" | "BL" | "BC" | "BR";
