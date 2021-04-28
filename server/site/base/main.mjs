export default function main(conf) {
	let sys = conf.system.sys;
	let module = sys.extend("/system.youni.works/engine/Module", conf.module);
	module.compile();

	let test = sys.extend("/base.youni.works/command/Command");
	sys.implement(test, sys.forName("/base.youni.works/control/Owner")[sys.symbols.interface]);
	console.log("test", test);

	return module;
}