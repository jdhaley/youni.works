export default function main(sys, conf) {
	const pkg = sys.load(conf.packages);
	let service = pkg.services.public;
	let parser = sys.extend(pkg.parser.Parser, {
		service: service
	});
	parser.save(conf.test);
	let loader = sys.extend(pkg.loader.Loader, {
		service: service,
		package: {}
	});
	let source = loader.open("youni.works/base/control");
	//return member;
}