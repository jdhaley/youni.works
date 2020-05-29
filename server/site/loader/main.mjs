export default function main(sys, conf) {
	const pkg = sys.load(conf.packages);
	let parser = sys.extend(pkg.parser.Parser, {
		service: pkg.services.public
	});
	let member = parser.save(conf.test);
	//return member;
}