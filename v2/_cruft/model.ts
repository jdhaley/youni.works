import { bundle, Sequence } from "../base/util";

/*
	A *value* is a model instance.
	A *model* classifies a value into unit, record, list.
*/
export type value =  unit | Sequence<unknown> | bundle<unknown> ;

export type unit = string | number | boolean | Date | null | unknown;

// export interface list extends Iterable<value> {
// 	length?: number;
// }

