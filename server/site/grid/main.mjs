//import model from "./conf/testModel.mjs";
export default function main(sys, conf) {
//	pkg.app.Application.save("/file/stamp/testModel.json", model);
	conf.packages = sys.load(conf.packages);
	const pkg = conf.packages;
	
	let app = pkg.app.Application.createView(document.body);
	app.path = "/file/stamp/data.json";
	app.controller.owner.open("/file/stamp/types.json", loadTypes);
	
	function loadTypes(msg) {
		app.types = JSON.parse(msg.content);
		app.controller.owner.open(app.path, loadData)
	}
	function loadData(msg) {
		app.model = JSON.parse(msg.content);
		app.controller.show(app, "Variety", app.model.issues[0].varieties);
		app.controller.show(app, "Album", app.model);
	}
}