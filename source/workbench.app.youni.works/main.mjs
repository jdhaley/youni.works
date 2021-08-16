export default function main(module, conf) {
	module = module.use.system.load(module);
	conf.window = window;
	let app = module.create("/ui/app/App");
	app.start(conf);
	return module;
}