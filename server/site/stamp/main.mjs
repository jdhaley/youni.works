export default function main(sys, conf) {
	conf.packages = sys.load(conf.packages);
	const pkg = conf.packages;
	let ctx = sys.extend(pkg.layout.Context, {
		x: 0,
		y: 0,
		width: 216,
		height: 280,
		container: document.body
	});
	ctx.container = ctx.append("svg", {
		width: "108mm",
		height: "140mm",
		viewBox: "0 0 216 280",
		preserveAspectRatio: "xMinYMin slice"
	});
	let set = pkg.test.set;
	set.draw(ctx);
}
