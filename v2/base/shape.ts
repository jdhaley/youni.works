import { Control } from "./control";

export interface Shape {
	readonly area: Area;
	readonly arcs: Iterable<Arc>;

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

export interface Arc {
	from: Shape;
	to: Shape;
	//type$: string; "arc" (or possibly one of the arcTypes below.)
	//fromPoint: number; //connection point. 0 = center.
	//toPoint: number: //connection point. 0 = center.
	//arcType: undirected, reference/dependency, flow, extension, composite, agreggate, ...
	//arcStyle: arc, line, ortho, spline, paths
	//arcPath: array of points.
}

