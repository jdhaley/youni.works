export default function main(module, conf) {
	let pkg = module.package;
	let factory = Object.create(pkg.factory.Factory);
	//Factory extends Resolver - we need to add resolve manually while bootstrapping the factory.
	factory.resolve = pkg.factory.Resolver.resolve;
	factory.conf = conf;
	factory._dir = pkg;

	let loader = factory.create(pkg.context.Loader);
	factory.define(loader, "conf", conf);
	module.load = function(module) {
		return loader.load(module);	
	}
	return module.load(module);
}