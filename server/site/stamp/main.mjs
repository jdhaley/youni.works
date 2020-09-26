export default function main(sys, conf) {
	let pkg = sys.load(conf.packages);

	let app = pkg.grid.app.Application.createView(document.body);
	app.path = "/file/stamp/data.json";
	app.controller.open("/file/stamp/types.json", loadTypes);
	
	function loadTypes(msg) {
		app.types = sys.extend(null, JSON.parse(msg.content));
		app.controller.open(app.path, loadData)
	}
	function loadData(msg) {
		app.model = sys.extend(null, JSON.parse(msg.content));
		app.controller.show(app, "Album", app.model);
		pkg.stamp.Album.createView(app, app.model);

	}
}