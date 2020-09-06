export default function main(sys, conf) {
	conf.packages = sys.load(conf.packages);
	const pkg = conf.packages;

	let constrs = pkg.app.Factory.bind(conf.types);
	console.log(constrs);
	
	let app = pkg.app.Application.createView(document.body);
	app.types = conf.types;

	pkg.app.DataWindow.show(app, "Field", conf.types.Field);
	pkg.app.DataWindow.show(app, "Field", conf.types.Field[0]);
}
