export default function main(module, conf) {
	module = module.use.system.load(module);
	return module.create(conf.service);
}