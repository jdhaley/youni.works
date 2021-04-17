export default function main(conf) {
	let sys = bootSys(conf);
	return runtimeSys(sys, conf);
}

function runtimeSys(sys, conf) {
	/*
	 * The sys symbol is attached to Symbol so that Instance.get$sys can reference it.
	 */
	Symbol.sys = sys.symbols.sys;
	
	let system = sys.compile(conf.packages[conf.system], conf.system);
	sys = sys.extend(system.System, {
		packages: sys.extend(null, {
			[conf.system]: system
		}),
		symbols: sys.symbols,
		facets: sys.facets,
		loader: system.Loader,
		compiler: system.Compiler
	});
	sys.implement(system.Object, {
		symbol$sys: sys
	});
	return sys;
}

function bootSys(conf) {
	/*
	 * status symbol manages the compilation status and should not be defined in the
	 * sys.symbols.
	 */
	Symbol.status = Symbol("status");

	let system = conf.packages[conf.system];

	let object = Object.create(null);
	let instance = Object.create(object);
	let sys = Object.create(instance);

	object[Symbol.status] = "booting";

	system.System.implement(sys, system.System);
	sys.facets = Object.freeze(sys.extend(null, conf.facets));
	sys.symbols = Object.freeze(sys.extend(null, conf.symbols));
	sys.packages = sys.extend();
	sys.loader = sys.extend(instance, system.Loader);
	sys.compiler = sys.extend(instance, system.Compiler);

	sys.implement(instance, system.Instance);
	sys.implement(object, system.Object);
	sys.implement(object, {
		symbol$sys: sys
	});
	
	delete object[Symbol.status];
	
	return sys;
}