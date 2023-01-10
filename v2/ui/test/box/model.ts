export interface Box {
	level: number;
	partOf: Box;
	parts?: Box[];
	caption: string;

	header: unknown;
	body: unknown;
	footer: unknown;

	width: number;
	height: number;
	rotation: number;
	shape: string;
	qty: string | number;
}
