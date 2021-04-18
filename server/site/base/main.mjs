export default function main(conf) {
	let module = conf.sys.extend("system.youni.works/Module", conf.module);
	module.compile();
}