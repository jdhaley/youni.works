export default function main(sys, conf) {
	let pkg = sys.load(conf.packages);

	let app = pkg.grid.app.Application.createView(document.body);
	app.path = "/file/stamp/data.json";
	app.confPath = "/file/stamp/types.json";
	app.controller.open(app.confPath, loadTypes);
	
	function loadTypes(msg) {
		app.controller.open(app.path, loadData)
		app.conf = sys.extend(null, JSON.parse(msg.content));
		app.types = app.conf.types;
		app.controller.show(app, "MetaModel", app.conf);

	}
	function loadData(msg) {
		app.model = sys.extend(null, JSON.parse(msg.content));
		app.controller.show(app, "Album", app.model);
		pkg.stamp.Album.createView(app, undefined, app.model);

	}
}