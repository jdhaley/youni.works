/*
 * system - The system package.
 * System - The system interface.
 * sys - the System instance.
 */
export default function main(conf) {
	const system = loadSystem(conf);
	const System = system.System;
	const sys = System.extend(System, {
		packages: System.extend(system.Table, {
			[conf.system]: system
		}),
		symbols: Object.freeze(System.extend(system.Table, conf.symbols)),
		facets: System.extend(system.Table)
	});
	loadFacets(sys, conf);
	Object.freeze(sys.facets);
	system.Object.sys = sys;
	Object.freeze(system.Object);
let iface = createInterface(sys, conf.packages[conf.system].System);
console.log(iface);
	return Object.freeze(sys);
}

function loadSystem(conf) {
	let system = conf.packages[conf.system];
	const System = system.System;
	let pkg = System.extend(system.Table);
	for (let name in system) {
		let member = system[name];
		if (member && typeof member == "object" && Object.getPrototypeOf(member) == Object.prototype) {
			let type = member.type$ || null;
			delete member.type$; //so we don't get the object-facet warning.
			member = System.extend(type, member);
		}
		if (name.charAt(0) == name.charAt(0).toUpperCase()) {
			System.define(member, conf.symbols.name, name);
			//Don't freeze Object because we need to assign sys to it.
			if (name != "Object") Object.freeze(member);
		}
		pkg[name] = member;
	}
	return Object.freeze(pkg);
}

function loadFacets(sys, conf) {
	let Property = sys.packages[conf.system].Property;
	for (let name in conf.facets) {
		let facet = sys.extend(Property, conf.facets[name]);
		sys.facets[name] = Object.freeze(facet);
	}
}

function createInterface(sys, source) {
	let iface = sys.extend("youni.works/system/Interface", {
		properties: sys.extend("youni.works/system/Table")
	});
	for (let decl in source) {
		let name = sys.nameOf(decl);
		let facet = sys.facetOf(decl);
		iface.properties[name] = sys.declare(name, source[decl], facet || "const")
	}
	return iface;
}


//let iface = sys.create({
//	type$: "youni.works/system/Interface", 
//	properties: sys.create("youni.works/system/Table")
//})
