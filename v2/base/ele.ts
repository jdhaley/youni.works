
export interface ELE extends Element {
}
export function ele(value: any): Element {
	return value instanceof Element ? value : null;
}
