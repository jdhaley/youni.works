//import model from "./conf/testModel.mjs";
export default function main(sys, conf) {
//	pkg.app.Application.save("/file/stamp/testModel.json", model);
	let pkg = sys.load(conf.packages);

	pkg.layout.Album.createView(document.body, conf.model);

	let app = pkg.grid.app.Application.createView(document.body);
	app.path = "/file/stamp/data.json";
	app.controller.owner.open("/file/stamp/types.json", loadTypes);
	
	function loadTypes(msg) {
		app.types = sys.extend(null, JSON.parse(msg.content));
		app.controller.owner.open(app.path, loadData)
	}
	function loadData(msg) {
		app.model = sys.extend(null, JSON.parse(msg.content));
		app.controller.show(app, "Album", app.model);
	}
}