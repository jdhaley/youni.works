import { NODE, RANGE } from "./dom";
import { NodeContent } from "./editor";
import { Extent } from "./util";
import { Content } from "./view";

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
	filter(content: NodeContent): boolean {
		return !this.extent.intersectsNode(content.node);
	}
}