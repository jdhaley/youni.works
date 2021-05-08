export default function main(conf) {
	let sys = conf.sys;
	let module = sys.extend("/system.youni.works/engine/Module", conf.module);
	module.compile(conf.packages);
	let app = sys.extend(module.public.app.App);
	app.start(conf.app);
	return module;
}