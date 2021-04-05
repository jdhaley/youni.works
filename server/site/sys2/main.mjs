
export default function main(conf) {
	let system = loadSystem(conf);
	let sys = createSys(system, conf);
//	//all Objects reference the sys instance:
//	System.Object.sys = sys;
	
	//initialize the facets
//	for (let facet in conf.facets) {
//		let type = sys.extend(System.Property, conf.facets[facet]);
//		sys.facets[facet] = type;
//	}
	return sys;
}

function loadSystem(conf) {
	let system = conf.packages[conf.system];
	const System = system.System;
	let target = System.extend(system.Table);
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
		target[name] = member;
	}
	return Object.freeze(target);
}

function createSys(system, conf) {
	let sys = system.System;
	system.Object.sys = sys;
	Object.freeze(system.Object);
	//create the System instance:
	return sys.extend(sys, {
		packages: sys.extend(system.Table),
		symbols: sys.extend(system.Table, conf.symbols),
		facets: createFacets(system, conf)
	});
}

function createFacets(system, conf) {
	//sys.extend(system.Table)
}
