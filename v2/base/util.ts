export const CHAR = Object.freeze(extend(null, {
	NBSP: "\u00a0",
	ZWSP: "\u200b",
	STX: "\u0002",
	ETX: "\u0003"
}));


export interface bundle<T> {
	[key: string]: T
}

export interface Sequence<T> extends Iterable<T> {
	readonly length: number;
}
export interface Collection<T>  {
	contains(value: T): boolean;
	add(value: T): void;
	remove(value: T): void;
}
export interface Entity<T> {
	readonly id?: T;
	at(name: string): T;
	put(name: string, value?: T): void;
}

export const EMPTY = Object.freeze({
	object: Object.freeze(Object.create(null)),
	array: Object.freeze([]) as any[],
	function: Object.freeze(function nil(any: any): any {})
});

export function extend(proto: Object, extension: Object) {
	let object = Object.create(proto);
	for (let name in extension) {
		object[name] = extension[name];
	}
	return object;
}

export function formatDate(date: Date) {
	let year    = "" + date.getFullYear();
	let month   = "" + (date.getMonth() + 1); 
	let day     = "" + date.getDate();
	let hour    = "" + date.getHours();
	let minute  = "" + date.getMinutes();
	//let second  = "" + date.getSeconds();

	if (month.length == 1) month = "0" + month;
	if (day.length == 1) day = "0" + day;
	if (hour.length == 1) hour = "0" + hour;
	if (minute.length == 1) minute = "0" + minute;
	return year + month + day + "_" + hour + minute;
}
