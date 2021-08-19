export default function main(module, conf) {
	module = module.use.system.load(module);
	conf.window = window;
	let app = module.create(conf.appType);
	app.start(conf);
	return module;
}