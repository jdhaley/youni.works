export default function main(conf) {
	let sys = conf.system.sys;
	let module = sys.extend("system.youni.works/Module", conf.module);
	module.compile(conf.packages);
	return module;
}