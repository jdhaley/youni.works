/*
 * system - The system package.
 * System - The system interface.
 * sys - the System instance.
 */
export default function main(conf) {
	let sys = createSys(conf);
	sys.packages[conf.system] = sys.compile(conf.packages[conf.system]);
	
	let test = sys.compile(conf.packages["test"], "test");
	console.log(test);
	return sys;
}
function createSys(conf) {
	let system = conf.packages[conf.system];
	let System = system.System;
	System = System.extend(system.Instance, System);
	const sys = System.extend(System, {
		packages: System.extend(),
		symbols: Object.freeze(System.extend(null, conf.symbols)),
		facets: Object.freeze(System.extend(null, conf.facets)),
		loader: System.extend(system.Instance, system.Loader),
		compiler: System.extend(system.Instance, system.Compiler)
	});
	system.Instance.sys = sys;
//	Object.freeze(system.Instance);
//	return Object.freeze(sys);
	return sys;
}
