export default function main(sys, conf) {
	const pkg = sys.load(conf.packages);
	let Loader = pkg.member.Loader;
	let loader = Loader.sys.extend(Loader, {
		service: pkg.services.public
	});
	let member = loader.load(conf.test);
	console.log(member);
	console.log(JSON.stringify(member));
	return member;
}