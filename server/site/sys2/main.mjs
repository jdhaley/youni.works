/*
 * system - The system package.
 * System - The system interface.
 * sys - the System instance.
 */
export default function main(conf) {
	const sys = createSys(conf);
	let test = sys.compile(conf.packages["test"], "test");
	console.log(test);
	return sys;
}
function createSys(conf) {
	let sys = bootSys(conf);
	let system = sys.compile(conf.packages[conf.system]);
	sys = sys.extend(system.System, {
		packages: sys.packages,
		symbols: sys.symbols,
		facets: sys.facets,
		loader: system.Loader,
		compiler: system.Compiler
	});
	system.Instance.sys = sys;
	sys.packages[conf.system] = system;
	return sys;
}

function bootSys(conf) {
	let system = conf.packages[conf.system];
	let System = system.System;
	System = System.extend(system.Instance, System);
	System[Symbol.toStringTag] = "System";
	const sys = System.extend(System, {
		packages: System.extend(),
		symbols: Object.freeze(System.extend(null, conf.symbols)),
		facets: Object.freeze(System.extend(null, conf.facets)),
		loader: System.extend(system.Instance, system.Loader),
		compiler: System.extend(system.Instance, system.Compiler)
	});
	system.Instance.sys = sys;
	return sys;
}

