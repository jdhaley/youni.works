export default function main(sys, conf) {
	let test = conf.packages;
	conf.packages = sys.load(conf.packages);
	const pkg = conf.packages;
	if (window.location.search == "?parse") {
		let parser = sys.extend(pkg.parser.Parser, {
			fs:  pkg.services.public.fs
		});
		for (let name in test) {
			parser.save(test[name]);
		}
	} else {
		let loader = sys.extend(pkg.loader.Loader, {
			fs: pkg.services.public.fs,
			package: {}
		});
		loader.forName("youni.works/web/client");
		console.log(loader.package);
		//return member;
	}
}