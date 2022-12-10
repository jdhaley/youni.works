import { ele, ELE, NODE, RANGE } from "../../base/dom.js";

import { Box } from "../display.js";
import { Viewbox } from "./editbox.js";
import { getContentView } from "../uiUtil.js";
import { ContentView, Viewer } from "../../base/view.js";

export class RecordBox extends Viewbox {
	memberType = "field";

	get(name: string): ContentView {
		for (let node of this.content.childNodes) {
			let view = getContentView(node);
			if (name == view?.type.name) return view;
		}
	}

	get title(): string {
		return this.get("title").content.textContent;
	}

	viewValue(model: unknown | ELE): void {
		for (let name in this.type.types) {
			this.content.append(this.viewMember(name, model ? model[name] : undefined).view);
		}
	}
	viewElement(content: ELE): void {
		// let idx = {};
		for (let member of content.children) {
			this.viewMember(member.nodeName, member);
			//idx[member.nodeName] = member;
		}
		// for (let name in this.type.types) {
		// 	this.viewMember(name, idx[name]);
		// }
	}
	protected viewMember(name: string, value: any): Box {
		let type = this.type.types[name];
		let member = type.create(value) as Box;
		this.content.append(member.view);
		member.view.classList.add(this.memberType);
		return member;
	}

	valueOf(range?: RANGE): unknown {
		let model = recordContent(null, this.content as ELE, range);
		if (model) {
			model["type$"] = this.type.name;
		}
		return model;
	}
}

function recordContent(model: unknown, view: NODE, range: RANGE): unknown {
	if (range && !range.intersectsNode(view)) return model;
	
	for (let child of view.childNodes) {
		if (ele(child)?.classList.contains("field")) {
			let viewer = child["$control"] as Box;
			let value = viewer.valueOf(range);
			if (value) {
				if (!model) model = Object.create(null);
				model[viewer.type.name] = value;
			}
		} else {
			model = recordContent(model, child, range);
		}
	}
	return model;
}
