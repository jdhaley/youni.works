export default function main(sys, conf) {
	const pkg = sys.load(conf.packages);
	let Loader = pkg.member.Loader;
	let loader = Loader.sys.extend(Loader);
	let member = loader.load(conf.test);
	console.log(member);
	return member;
}