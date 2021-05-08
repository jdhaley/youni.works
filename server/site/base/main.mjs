export default function main(conf) {
	let sys = conf.sys;
	let module = sys.extend(sys.use.Module, conf.module);
	module.compile(conf.packages);
	return module;
}