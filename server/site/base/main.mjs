export default function main(conf) {
	let sys = conf.system.sys;
	let module = sys.extend("/system.youni.works/engine/Module", conf.module);
	module.compile();
	return module;
}