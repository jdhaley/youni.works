import { ELE } from "../base/dom";
import { BaseType } from "../base/type";
import { bundle } from "../base/util";

export class GenType extends BaseType<any> {
	declare types: bundle<GenType>;
	generate(target: ELE) {
		let ele = target.ownerDocument.createElement(this.conf.nodeName);
		target.append(ele);
		for (let name in this.types) {
			let type = this.types[name];
			type.generate(ele);
		}
	}
}