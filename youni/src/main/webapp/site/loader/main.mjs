export default function main(sys, conf) {
	const pkg = sys.load(conf.packages);
	let parser = sys.extend(pkg.parser.Parser);
	let member = parser.parse(conf.test);
	console.log(member);
	console.log(JSON.stringify(member));
	return member;
}