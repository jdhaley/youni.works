export interface Box {
	level: string;
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
	boxes?: Box[];
	partOf: Box;
}
