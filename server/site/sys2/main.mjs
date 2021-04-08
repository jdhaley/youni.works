/*
 * system - The system package.
 * System - The system interface.
 * sys - the System instance.
 */
export default function main(conf) {
	const system = createSystemPackage(conf);
	const System = system.System;
	const sys = System.extend(System, {
		packages: System.extend(system.table, {
			[conf.system]: system
		}),
		symbols: Object.freeze(System.extend(system.table, conf.symbols)),
		facets: System.extend(system.table),
		loader: System.extend(system.Loader),
		compiler: System.extend(system.Compiler)
	});
	loadFacets(sys, conf);
	Object.freeze(sys.facets);
	system.Instance.sys = sys;
	Object.freeze(system.Instance);
	Object.freeze(sys);
	conf.packages[conf.system] = sys.compiler.compile(conf.packages[conf.system], conf.system);
	let test = sys.compiler.compile(conf.packages["test"], "test");
	console.log(test);
	return sys;
}

function createSystemPackage(conf) {
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
