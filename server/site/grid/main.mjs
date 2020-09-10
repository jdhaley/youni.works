import model from "./conf/testModel.mjs";
export default function main(sys, conf) {
//	pkg.app.Application.save("/file/stamp/testModel.json", model);
	conf.packages = sys.load(conf.packages);
	const pkg = conf.packages;
	
	let app = pkg.app.Application.createView(document.body);
	app.path = "/file/stamp/data.json";
	pkg.app.Application.open("/file/stamp/types.json", loadTypes);
	
	
	function loadTypes(msg) {
		app.types = JSON.parse(msg.content);
		app.controller.open(app.path, loadData)
	}
	function loadData(msg) {
		app.model = JSON.parse(msg.content);
		pkg.app.DataWindow.show(app, "Variety", app.model.issues[0].varieties);
		pkg.app.DataWindow.show(app, "Variety", app.model.issues[0].varieties[0]);
	}
}