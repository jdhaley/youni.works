export default function main(module, conf) {
	module = module.use.system.load(module);
	let app = module.create(conf);
	app.conf.window = window;
	app.start();
	return module;
}