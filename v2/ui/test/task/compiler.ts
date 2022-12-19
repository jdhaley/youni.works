import { base, facet } from "./facets.js";

export const TYPE = Symbol("type");
export type factory = (source: source, name?: string) => object;

export function createCompiler(facets: bundle<facet>): factory {
	let factory = new Factory(facets);
	return factory.compile.bind(factory);
}

interface bundle<T> {
	[key: string | symbol]: T
}

const TARGET = Symbol("target");
const NAME = Symbol.toStringTag;

const SCOPE = Symbol("scope");
const TYPE_PROP = "type$";

type source = bundle<any>;

class Factory  {
	constructor(facets: bundle<facet>) {
		this.#facets = facets;
	}
	#facets: bundle<facet>;

	compile(source: source, name?: string) {
		let type = this.#compileType(source);

		let target = Object.create(source.prototype$ || null);
		target[TYPE] = type;
		let self = type[TYPE];
		for (let name in self) self[name].define(target);

		//Set the name after extension. Any object without a name is being processed.
		if (name.at(0) == name.at(0).toUpperCase()) {
			target[NAME] = name + "Type";
		}
		return target;
	}
	#compileType(source: source) {
		let type = Object.create(null);
		source[TYPE] = type;

		let self = Object.create(null);
		type[TYPE] = self;

		let typeNames = source[TYPE_PROP];
		let types = typeNames?.split(" ") || [];
		let sups = [];

		for (let typeName of types) {
			if (typeName) { //handle multiple spaces
				try {
					let mixin = this.#forName(source, typeName);
					if (!mixin) throw new Error("not found.")
					let sup =  mixin[TYPE];
					type[typeName] = sup;
					sups.push(sup);
					let supSelf = sup[TYPE];
					for (let member in supSelf) {
						if (self[member] === undefined) self[member] = supSelf[member];
					}
				} catch (e) {	
					throw new Error(`implement "${typeNames}": on "${typeName}": ${e.message}`);
				}
			}
		}
		
		for (let decl in source) {
			if (!decl.endsWith("$")) {
				let desc = this.createDescriptor(decl, source);
				self[desc.name] = desc;
			}
		}
		return type;
	}
	createDescriptor(decl: string, scope: any) {
		let [name, facet] = this.parseDeclaration(decl);
		let expr = scope[decl];
		if (typeof expr == "object" && Object.hasOwn(expr, TYPE_PROP)) {
			expr[NAME] = name;
			expr[SCOPE] = scope;
			expr = this.#forName(expr as source, name);
		}
		return facet(name, expr, facet.name);
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
	#forName(source: source, name: string) {
		for (let scope = source; scope; scope = scope[SCOPE] as source) {
			let value = scope[name];
			if (value) {
				if (value[TARGET]) return value[TARGET];
				if (Object.hasOwn(value, "type$")) {
					value[SCOPE] = scope;
					return this.compile(value, name);
				}
				return value;
			}
			if (scope[SCOPE] == source) throw new Error("cycle detected.");
		}
	}
}

export const compile = createCompiler(base);
