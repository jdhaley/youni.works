export default function main(sys, conf) {
	conf.packages = sys.load(conf.packages);
	const pkg = conf.packages;
	document.types = conf.types;

	let app = pkg.app.Application.createView(document.body);
	pkg.app.DataWindow.show(app, {
		type: "Field"
	}, conf.types.Field);
	pkg.app.DataWindow.show(app, {
		type: "Field"
	}, conf.types.Field[0]);
}
