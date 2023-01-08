export interface Box {
	partOf: Box;
	parts?: Box[];
	level: number;
	title: string;
	header: string;
	body: unknown;
	footer: string;
	width: number;
	height: number;
	rotation: number;
	shape: string;
	///
	qty: string | number;
	id: string;
}
