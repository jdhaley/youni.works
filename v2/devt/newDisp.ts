// export class ElementType extends ViewType<Element> {
// 	declare readonly owner: ElementOwner;
// 	declare readonly types: bundle<ElementType>;
// 	declare readonly content: boolean;

// 	createView(): ElementView {
// 		let view = this.owner.createElement(this.conf.tagName)
// 		view.$controller = this;
// 		if (this.content) {
// 			view.$content = view;
// 			view.id = this.owner.nextId();
// 		}
// 		if (this.propertyName) {
// 			view.setAttribute("data-name", this.propertyName);
// 		} else {
// 			view.setAttribute("data-type", this.name);
// 		}
// 		return view;
// 	}
// 	getPartOf(view: Element): ElementView {
// 		for (let parent = view.parentElement; parent; parent = parent.parentElement) {
// 			if (parent["$controller"]) return parent as any;
// 		}
// 	}
// 	getPartsOf(view: Element): Iterable<ElementView> {
// 		return view.children as Iterable<ElementView>;
// 	}
// 	getContentOf(view: ElementView) {
// 		if (this.content) return view;
// 		if (this.model == "record") for (let part of this.getPartsOf(view)) {
// 			if (part.$controller?.content) {
// 				view.$content = part;
// 				return part;
// 			}
// 		}
// 	}

// 	toModel(view: ElementView, range?: Range): content {
// 		let content = this.getContentOf(view);
// 		let type = content?.$controller;
// 		if (type) return type.owner.modellers[type.model].call(type, content, range);
// 	}
// 	toView(model: content): Element {
// 		let view = this.createView();
// 		this.owner.viewers[this.model].call(this, view, model);
// 		return view;
// 	}
// }

//edit.ts....................

