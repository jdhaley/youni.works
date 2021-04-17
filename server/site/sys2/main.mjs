export default function main(conf) {
	let sys = bootSys(conf);
	return runtimeSys(sys, conf);
}

function runtimeSys(sys, conf) {
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
	Symbol.sys = conf.symbols.sys;
	
	let system = conf.packages[conf.system];

	let object = Object.create(null);
	let instance = Object.create(object);
	let sys = system.System.extend(instance, system.System);
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
	
	return sys;
}