export default function main(conf) {
	let sys = bootSys(conf);
	let system = sys.compile(conf.packages[conf.system], conf.system);
	sys = sys.extend(system.System, {
		packages: sys.packages,
		symbols: sys.symbols,
		facets: sys.facets,
		loader: system.Loader,
		compiler: system.Compiler
	});
	return initSys(sys, system, conf.system);
}

function initSys(sys, system, moduleId) {
	sys.define(system.Object, sys.symbols.sys, sys);
	sys.packages[moduleId] = system;
	return sys;
}

function bootSys(conf) {
/*
 * system - The system package.
 * System - The system interface.
 * sys - the System instance.
 */
//	Symbol.sys = conf.symbols.sys;
//	let Obj = Object.create(null);
//	let Instance = Object.create()
//	let system = conf.packages[conf.system];
//	let System = system.System;
//	System.facets = conf.facets;
//	System.symbols = conf.symbols;
//	
//	system.Object = System.extend(null, system.Object);
//	system.Object[Symbol.sys] = System;
//	system.Instance = System.extend(system.Object, system.Instance);
//
//	System = System.extend(system.Instance, System);
////	System[Symbol.toStringTag] = "System";
	Symbol.sys = conf.symbols.sys;
	
	let system = conf.packages[conf.system];
	let System = system.System;
	System.facets = conf.facets;
	System.symbols = conf.symbols;
	
	system.Object = System.extend(null, system.Object);
//	system.Object[Symbol.sys] = System;
	system.Instance = System.extend(system.Object, system.Instance);
	system.Instance[Symbol.toStringTag] = "Instance";
	System = System.extend(system.Instance, System);
//	System[Symbol.toStringTag] = "System";

	const sys = System.extend(System, {
		packages: System.extend(),
		symbols: Object.freeze(System.extend(null, conf.symbols)),
		facets: Object.freeze(System.extend(null, conf.facets)),
		loader: System.extend(system.Instance, system.Loader),
		compiler: System.extend(system.Instance, system.Compiler)
	});
	Reflect.defineProperty(system.Object, Symbol.sys, {configurable: true, value: sys});
	return sys;
}

