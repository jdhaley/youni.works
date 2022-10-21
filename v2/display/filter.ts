import { NODE, RANGE } from "../base/dom";
import { Extent } from "../base/util";
import { Content } from "../base/view";

export abstract class Filter {
	abstract filter(content: Content): boolean;
}
export abstract class ExtentFilter<T> extends Filter {
	declare extent: Extent<T>
}

export class RangeFilter extends ExtentFilter<NODE> {
	constructor(range: RANGE) {
		super();
		this.extent = range;
	}
	declare extent: RANGE;
	filter(content: Content): boolean {
		return !this.extent.intersectsNode(content["node"]);
	}
}

type filter = (content: Content) => boolean;
export function createFilter(range: Range): filter {
	return function filter(content: Content) {
		return !range.intersectsNode(content["node"] as Node);
	}
}
