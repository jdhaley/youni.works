export default function main(sys, conf) {
	conf.packages = sys.load(conf.packages);
	const pkg = conf.packages;
	document.types = conf.types;

	let app = pkg.item.Application.createView(document.body);
	pkg.item.DataWindow.show(app, {
		type: "Field"
	}, conf.types.Field);
}
