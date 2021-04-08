/*
 * system - The system package.
 * System - The system interface.
 * sys - the System instance.
 */
export default function main(conf) {
	const system = loadSystem(conf);
	const System = system.System;
	const sys = System.extend(System, {
		packages: System.extend(system.table, {
			[conf.system]: system
		}),
		symbols: Object.freeze(System.extend(system.table, conf.symbols)),
		facets: System.extend(system.table)
	});
	loadFacets(sys, conf);
	Object.freeze(sys.facets);
	system.Instance.sys = sys;
	Object.freeze(system.Instance);
	console.log(load(sys, conf.packages[conf.system]));
	
let iface = createInterface(sys, conf.packages[conf.system]);
console.log(iface);
	return Object.freeze(sys);
}

function loadSystem(conf) {
	let system = conf.packages[conf.system];
	const System = system.System;
	let pkg = System.extend(system.table);
	for (let name in system) {
		let member = system[name];
		if (member && typeof member == "object" && Object.getPrototypeOf(member) == Object.prototype) {
			let type = member.type$ || null;
			//delete member.type$; //so we don't get the object-facet warning.
			member = System.extend(type, member);
		}
		if (name.charAt(0) == name.charAt(0).toUpperCase()) {
			System.define(member, conf.symbols.name, name);
			//Don't freeze Object because we need to assign sys to it.
			if (name != "Instance") Object.freeze(member);
		}
		pkg[name] = member;
	}
	return Object.freeze(pkg);
}

function loadFacets(sys, conf) {
	let Property = sys.packages[conf.system].Property;
	for (let name in conf.facets) {
		let facet = sys.extend(Property, conf.facets[name]);
		sys.define(facet, Symbol.toStringTag, name);
		sys.facets[name] = Object.freeze(facet);
	}
}

function load(sys, source) {
	let system = sys.forName("youni.works/system/");
	let value = loadValue(sys, source);
	sys.packages[""] = value;
	value = compileValue(sys, value)
	delete sys.packages[""];
	return Object.freeze(value);	
}

function compileValue(sys, value) {
	console.log(value);
}

function loadValue(sys, value) {
	let system = sys.forName("youni.works/system/");	
	let type = typeof value;
	if (type == "object") {
		let proto = Object.getPrototypeOf(value);
		if (proto == Array.prototype) {
			let array = Object.extend(system.Array, {
				length: value.length
			});
			for (let i = 0; i < value.length; i++) {
				array[i] = loadValue(sys, value[i]);
			}
			value = Object.freeze(array);
		} else if (proto == Object.prototype) {
			if (Reflect.getOwnPropertyDescriptor(value, "type$")) {
				value = createInterface(sys, value);
			} else {
				let parcel = sys.extend(null);
				for (let decl in value) {
					let name = sys.nameOf(decl);
					let facet = sys.facetOf(decl);
					let x = loadValue(sys, value[decl]);
					if (facet) {
						sys.facets[facet].declare(name, x).define(parcel);
					} else {
						parcel[name] = x;
					}
				}
				value = Object.freeze(parcel)	
			}
		}
	}
	return value;
}

function createArray(sys, source) {
	let system = sys.forName("youni.works/system/");
	let length = source.length;
	let array = Object.extend(system.Array, {
		length: length
	});
	for (let i = 0; i < length; i++) {
		array[i] = loadValue(sys, source[i]);
	}
	return Object.freeze(array);
}

function createDeclarations(sys, source) {
	let system = sys.forName("youni.works/system/");
	let decls = sys.extend(system.table);
	for (let decl in source) {
		let name = sys.nameOf(decl);
		let value = loadValue(sys, source[decl]);
		let facet = sys.facetOf(decl);
		if (!facet) {
			facet = typeof value == "function" ? "const" : "var";
		}
		if (name) decls[name] = sys.declare(name, value, facet);
	}
	return decls;
}
function createInterface(sys, source) {
	let system = sys.forName("youni.works/system/");
	return sys.extend(system.Interface, {
		type: source.type$,
		properties: createDeclarations(sys, source)
	});
}

//function loadSource(sys, source) {
//	let pkg = Object.create(null);
//	for (let decl in source) {
//		let facet = sys.facetOf(decl);
//		let name = sys.nameOf(decl);
//		let value = source[decl];
//		value.facet = facet;
//		if (pkg.name) console.warn(`Duplicate declaration name "${name}" in source.`);
//		pkg[name] = source[decl];
//	}
//	let type = source.type$ || null;
//	if (typeof type != "object") type = sys.forName(type);
//	let target = Object.create(type);
//	
//	for (let decl in source) {
//		let facet = sys.facetOf(decl);
//		let name = sys.nameOf(decl);
//		let value = loadValue(source[decl]);
//		if (typeof value) {
//			member = loadSource(sys, member);
//			if (name.charAt(0) == name.charAt(0).toUpperCase()) {
//				System.define(member, conf.symbols.name, name);
//				//Don't freeze Object because we need to assign sys to it.
//				if (name != "Object") Object.freeze(member);
//			}
//		}
//		pkg[name] = member;
//	}
//}