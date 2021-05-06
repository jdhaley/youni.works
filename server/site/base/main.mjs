export default function main(conf) {
	let sys = conf.sys;
	let module = sys.extend("/system.youni.works/engine/Module", conf.module);
	module.compile(conf.packages);
	return module;
}