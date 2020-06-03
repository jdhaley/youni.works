export default function main(sys, conf) {
	const pkg = sys.load(conf.packages);
	let service = pkg.services.public;
	if (window.location.search == "?parse") {
		let parser = sys.extend(pkg.parser.Parser, {
			service: service
		});
		for (let name in conf.packages) {
			parser.save(conf.packages[name]);
		}
	} else {
		let loader = sys.extend(pkg.loader.Loader, {
			service: service,
			package: {}
		});
		loader.forName("youni.works/web/platform");
		console.log(loader.package);
		//return member;
	}
}