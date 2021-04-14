export default function main(sys, conf) {
	let system = conf.packages.system;
	sys = system.System;
	sys = sys.extend(sys, {
		packages: sys.extend(),
		log: conf.log,
		environment: conf.environment
	});
	let pkg = conf.packages.compiler;
	let constr = sys.extend(pkg.Context, pkg.Constructor);
	sys.implement(constr, {
		sys: sys,
		constructors: conf.constructors,
		facets: conf.facets
	});
	sys = constr.loader();
	return conf.packages.boot.Booter.boot(sys, conf);
}
