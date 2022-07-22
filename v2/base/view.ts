import {content, ContentType, Type, typeOf} from "./model.js";
import {Controller, Owner} from "./controller.js";
import {bundle} from "./util.js";
import {loadBaseTypes, loadTypes} from "./loader.js";

export function viewType(value: any): string {
	let type = typeOf(value);
	switch (type) {
		case "string":
		case "number":
		case "boolean":
		case "date":
			return "text";
		default:
			return type;
	}
}
type viewer = (this: ViewType<unknown>, view: unknown, model: content) => void;
type modeller = (this: ViewType<unknown>, view: unknown) => content;
export abstract class ViewOwner<V> extends Owner<V> {
	constructor(conf?: bundle<any>) {
		super(conf);
		if (conf) {
			this.viewers = conf.viewers;
			this.modellers = conf.modellers;
		}
	}
	viewers: bundle<viewer>
	modellers: bundle<modeller>;
	unknownType: ViewType<V>;
	types: bundle<ViewType<V>>;

	getControlOf(view: V): ViewType<V> {
		let type = view["type$"];
		if (!type) {
			console.log(view);
		}
		return type;
	}
	
	initTypes(source: bundle<any>, base: bundle<ViewType<V>>) {
		base = loadBaseTypes(this);
		this.types = loadTypes(source, base) as bundle<ViewType<V>>;
		this.unknownType = this.types[this.conf.unknownType];
	}
}

export abstract class ViewType<V> extends Controller<V> implements ContentType<V> {
	declare owner: ViewOwner<V>;
	declare model: "record" | "list" | "text";
	declare name: string;
	declare propertyName?: string;
	declare types: bundle<ViewType<V>>;

	generalizes(type: Type): boolean {
		return type == this;
	}
	toModel(view: V): content {
		return this.owner.modellers[this.model].call(this, view);
	}
	toView(model: content): V {
		let view = this.createView();
		this.viewContent(view, model);
		return view;
	}
	viewContent(view: V, model: content): void {
		this.owner.viewers[this.model].call(this, view, model);
	}

	abstract createView(): V;
	abstract getTextOf(view: V): string;
	abstract setTextOf(view: V, value: string): void;
	abstract appendTo(view: V, value: any): void 
}
