import { facet } from "../compiler/compiler.js";
import { base } from "../compiler/facets.js";

export type factory = (source: source, name?: string) => object;

export function createFactory(facets: bundle<facet>, prototype?: object): factory {
	let factory = new Factory(facets, prototype);
	return factory.createInstance.bind(factory);
}

interface bundle<T> {
	[key: string | symbol]: T
}

const SCOPE = Symbol("scope");
const NAME = Symbol("name");
const TYPE = Symbol("type");
const TYPE_PROP = "type$";

type source = bundle<unknown>;

class Factory  {
	constructor(facets: bundle<facet>, prototype?: object) {
		this.#facets = facets;
		this.#prototype = prototype || null;
	}
	#facets: bundle<facet>;
	#prototype: object;

	createInstance(source: source, name?: string) {
		if (!source[TYPE]) this.extend(source, name);
		let target = Object.create(this.#prototype);
		target[TYPE] = source[TYPE];
		for (let decl in source) {
			if (decl != TYPE_PROP) this.createProperty(target, decl, source);
		}
		return target;
	}
	extend(source: source, name: string) {

		source[TYPE] = Object.create(null);
		source[TYPE]["$" + (name || "")] = source;
		let typeNames = source[TYPE_PROP] + "";
		let types = typeNames.split(" ");

		for (let i = types.length; i; i--) {
			let typeName = types[i - 1];
			if (typeName) { //handle multiple spaces
				try {
					let mixin = this.get(source, typeName) as source;
					if (mixin) {
						source[TYPE][typeName] = mixin;
						for (let key in mixin) source[key] = mixin[key];
					}
				} catch (e) {	
					throw new Error(`implement("${typeNames}"): on "${typeName}": ${e.messasge}`);
				}
			}
		}
	}
	createProperty(target: object, decl: string, scope: any) {
		let [name, facet] = this.parseDeclaration(decl);
		let expr = scope[decl];
		if (typeof expr == "object" && Object.hasOwn(expr, TYPE_PROP)) {
			expr[NAME] = name;
			expr[SCOPE] = scope;
			expr = this.createInstance(expr as source, name);
		}
//		facet(name, expr, facet.name).define(target);
	}
	parseDeclaration(decl: string): [property: string, facet: facet] {
		let index = decl.indexOf("$");
		let facetName = "";
		if (index) facetName = decl.substring(0, index);
		let ffn = this.#facets.var;
		if (facetName) {
			ffn = this.#facets[facetName];
			if (!ffn) throw new Error(`Facet "${facetName}" is not defined.`);	
		}
		return [decl.substring(index + 1), ffn];
	}
	get(source: source, name: string) {
		for (let scope = source; scope; scope = scope[SCOPE] as source) {
			let value = scope[name];
			if (value) return value;
			if (scope[SCOPE] == source) throw new Error("cycle detected.");
		}
	}
}

export const defaultFactory = createFactory(base);
